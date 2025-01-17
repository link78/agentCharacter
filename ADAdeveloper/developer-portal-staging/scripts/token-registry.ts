import * as fs from "fs";
import * as path from "path";
import {
  getStringContentAsync,
} from "./reusable";
import {
  tr_docs_path,
  tr_url,
  tr_overview_url,
  tr_raw_wiki_url,
  tr_github_wiki,
  custom_edit_url
} from "./constants";

// Current pathname
const path_name = path.basename(__filename);

// Fetch and manipulate overview markdown file
const getOverviewMarkdown = async () => {
  // Fetch raw overview file
  const content = await getStringContentAsync(tr_overview_url);

  // Modify content to ensure compatibility
  const modified_content = overviewStringManipulation(content);

  return modified_content;
};

// Manipulate URL string
const tokenRegistryStringManipulation = (content: string) => {
  // Encode symbols for url purpose
  content = encodeURIComponent(content);

  // Replace encoded %20 space with '-' (needs to be replaced in order to fetch data from the correct link)
  content = content.replace(/\%20/g, "-");

  // Replace '(' with '%28' for url purpose (is not included in URIComponent function)
  content = content.replace(/\(/g, "%28");

  // Replace ')' with '%29' for url purpose (is not included in URIComponent function)
  content = content.replace(/\)/g, "%29");

  return content;
};

// Manipulate markdown file name
const markdownStringManipulation = (content: string) => {
  // Encode symbols for url purpose
  content = encodeURIComponent(content);

  // Replace encoded %20 space with '-'
  content = content.replace(/\%20/g, "-");

  // Replace '?' with '%3F'
  content = content.replace(/\?/g, "%3F");

  // Replace '(' with ''
  content = content.replace(/\(/g, "");

  // Replace ')' with ''
  content = content.replace(/\)/g, "");

  // Remove '
  content = content.replace(/\'/g, "");

  return content;
};

// Clear up this is auto generated file from Token Registry repository
const injectAutogeneratedMessage = (content: string, file_name: string, path: string) => {
  return (
    content +
    "\n" +
    "## Token Registry Information  \nThis page was generated automatically from: [" +
    tr_github_wiki +
    "](" +
    tr_github_wiki +
    "/" +
    file_name +
    ")."
  );
}

// String manipulations to ensure compatibility
const stringManipulation = (content: string, file_name: string) => {
  // Remove `(` and `)` from relative links (temporary not in use, using hardcoded solution for now)
  // content = content.replace(/(?<=\]\()(.*)(?=\))/g, (x) => x.replace(/[()]/g, ''));

  // Remove `(` and `)` from relative links (temporary solution focusing on specific link, in the future needs to be changed to work through all of the links)
  content = content.replace(
    "How-to-prepare-an-entry-for-the-registry-(NA-policy-script)",
    "How-to-prepare-an-entry-for-the-registry-NA-policy-script"
  );

  // Clear up this is auto generated file from Token Registry repository
  content = injectAutogeneratedMessage(content, file_name, path_name);

  return content;
};

// Inject extra docusaurus doc tags and manipulate overview markdown file content
const overviewStringManipulation = (content: string) => {
  // Extra content
  const extra_content =
    "--- \nid: cardano-token-registry \ntitle: Cardano Token Registry \nsidebar_label: Overview \ndescription: The Cardano Token Registry provides a means to register off-chain token metadata that can map to on-chain identifiers. \nimage: /img/og/og-developer-portal.png \nsidebar_position: 1 \n--- \nThe [Cardano Token Registry](https://github.com/cardano-foundation/cardano-token-registry) provides a means to register off-chain token metadata to map to on-chain identifiers (typically hashes representing asset IDs, output locking scripts, or token forging policies).\n\n";

  // Add extra content
  content = extra_content + content;

  // Remove unused content
  content = content
    .replace("# cardano-token-registry", "")
    .split("## Step-by-Step")[0];

  // Replace relative links to absolute links.
  content = content.replace(
    /\bRegistry_Terms_of_Use.md\b/g,
    tr_url + "Registry_Terms_of_Use.md"
  );
  content = content.replace(
    /\bAPI_Terms_of_Use.md\b/g,
    tr_url + "API_Terms_of_Use.md"
  );
  content = content.replace(/\(\bmappings\b/g, "(" + tr_url + "mappings");

  // Inject token registry link info
  content =
    content +
    "  \n## Token Registry Information  \nThis page was generated automatically from: [" +
    tr_url +
    "](" +
    tr_url +
    "/" +
    "README.md" +
    ").";

  return content;
};

// In case we want a specific sidebar_position for a certain filename (otherwise alphabetically)
// In the future it will be better to get this information from the index.rst file
export const sidebarPosition = (file_name: string) => {
  if (file_name === "How to prepare an entry for the registry (NA policy script)")
    return "sidebar_position: 2\n";
  if (file_name === "How to prepare an entry for the registry (Plutus script)")
    return "sidebar_position: 3\n";
  if (file_name === "How to submit an entry to the registry")
    return "sidebar_position: 4\n";

  return ""; // Empty string means alphabetically within the sidebar
};

// Inject Docusaurus doc tags for title and add a nice sidebar
const injectDocusaurusDocTags = (content: string, file_name: string) => {

  // Remove '---' from doc to add it later
  content = content.substring(0, 3) === "---" ? content.slice(3) : content;

    // Replace '-' from url in order to create a clean sidebar label
    const modified_file_name = file_name.replace(/[-]/gm, " ");

    // Add '---' with doc tags for Docusaurus
    content =
      "--- \nsidebar_label: " +
      modified_file_name +
      custom_edit_url +
      "\ntitle: " +
      file_name +
      "\n" +
      sidebarPosition(file_name) +
      "--- " +
      "\n" +
      content;

  return content;
}

const main = async () => {
  console.log("Token Registry Content Downloading...");

  // Fetch raw wiki content for token registry
  const wiki_home_content = await getStringContentAsync(
    `${tr_raw_wiki_url}Home.md`
  );

  // Fetch raw overview content for token registry
  const overview_content = await getOverviewMarkdown();

  // Find wiki file names in order to fetch them individually
  const content_urls = wiki_home_content.match(/(?<=\[\[)(.*?)(?=\]\])/g);
  const tr_unique_urls = [...new Set(content_urls)];

  // Create token registry folder to store markdown files locally
  if (fs.existsSync(tr_docs_path)) {
    fs.rmSync(tr_docs_path, { recursive: true });
  }
  fs.mkdirSync(tr_docs_path, { recursive: true });

  // Create markdown overview file locally with downloaded content
  fs.writeFileSync(`${tr_docs_path}/Overview.md`, overview_content);

  // Save token registry markdown files into docs folder
  await Promise.all(
    tr_unique_urls.map(async (tr_url) => {
      // Get token registry url
      const tr_urls = await tokenRegistryStringManipulation(tr_url);

      // Get markdown file names
      const markdown_file_name = await markdownStringManipulation(tr_url);

      // Download markdown files
      const content = await getStringContentAsync(
        `${tr_raw_wiki_url}${tr_urls}.md`
      );

      // Manipulate content to ensure compatibility
      const manipulated_content = await stringManipulation(
        content,
        tr_urls
      );

      // Inject Docusaurus doc tags
      const manipulated_content_with_doc_tags = injectDocusaurusDocTags(manipulated_content, tr_url)

      // Create markdown files locally with downloaded content
      fs.writeFileSync(
        `${tr_docs_path}/${markdown_file_name}.md`,
        manipulated_content_with_doc_tags
      );
      console.log(`Downloaded to ${tr_docs_path}/${markdown_file_name}.md`);
    })
  );

  console.log("Token Registry Content Downloaded");
};

main();