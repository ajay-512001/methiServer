const fs = require('fs');
const path = require('path');

// Get the folder name from the command line argument
const folderName = process.argv[2];
const currentDir = process.cwd();

// Define the folder and file paths
const folderPath = path.join(path.join(currentDir, 'src', 'main'), folderName);
const files = [`${folderName}.controllers.js`, `${folderName}.routes.js`, `${folderName}.scripts.js`, `${folderName}.queries.js`];

// Function to create folder and files
function createModule(folder) {
  if (!folder) {
    console.error("Please provide a folder name.");
    return;
  }

  // Check if the folder already exists
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
    console.log(`Folder '${folder}' created successfully.`);

    // Create the files inside the folder
    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      fs.writeFileSync(filePath, `// ${file} content`);
      console.log(`File '${file}' created in ${folder}`);
    });
  } else {
    console.error(`Folder '${folder}' already exists.`);
  }
}

// Run the function with the provided folder name
createModule(folderName);
