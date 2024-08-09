import fs from 'fs'
import path from 'path';
import url from 'url';
import axios from 'axios'

// changes is here,
const project = 'barber' // the folder template name
const downloadDomain = 'https://example.com/barber/html/' // this is the demo link or domain that will contain the real image
const imgFolder = 'img' // this is the image folder, sometime img, images you need to check in the template folder


// this is the folder i work with, you can change the path base on your need
const dirname = 'F://project/template/' + project
const dirnameReverse = 'F:\\project\\template\\' + project + '\\'

// this is this project location, you can change to the template folder if you want
const baseLocalDir = 'images';



const folderPath = path.join(dirname, imgFolder);
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'];

// Function to list all images in a folder and its subfolders
function listImages(dirPath) {
  let results = [];

  // Read the directory contents
  const list = fs.readdirSync(dirPath);

  list.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively search in subdirectories
      results = results.concat(listImages(filePath));
    } else if (stat.isFile()) {
      // Check if the file has an image extension
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        const etapath = filePath.replace(dirnameReverse, downloadDomain)
        results.push(etapath);
      }
    }
  });

  return results;
}

// Get the list of images
const images = listImages(folderPath);

// Print the list of images
// images.forEach(image => console.log(image));

// Function to convert URL to local file path
function urlToLocalPath(fileUrl, baseLocalDir) {
  const parsedUrl = new url.URL(fileUrl);
  const filePath = parsedUrl.pathname;
  return path.join(baseLocalDir, filePath).replace(/\//g, path.sep);
}

// Function to download an image
async function downloadImage(imageUrl, localPath) {
  return new Promise(resolve => {
    const parsedUrl = new url.URL(imageUrl);
    // Ensure the directory exists
    fs.mkdir(path.dirname(localPath), { recursive: true }, async (err) => {
      if (err) throw err;
      try {
        console.log('Image: ' + parsedUrl)
        const response = await axios({
          url: parsedUrl,
          method: 'GET',
          responseType: 'stream',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0'
          },
          onDownloadProgress: (progressEvent) => {
            // Some image maybe large or take time to download, this just to make sure the code is stil runing not stuck
            if (progressEvent.lengthComputable) {
              // Calculate the percentage progress
              const total = progressEvent.total;
              const current = progressEvent.loaded;
              const percentage = ((current / total) * 100).toFixed(2);
    
              process.stdout.write(`\rDownload Progress: ${percentage}%`);
            } else {
              process.stdout.write(`\rDownload Progress: ${progressEvent.loaded} bytes received`);
            }
          },
        })

        // Create the write stream to save the file
        const fileStream = fs.createWriteStream(localPath)

        // Pipe the response stream to the file stream
        response.data.pipe(fileStream)

        // Wait for the file stream to finish writing
        fileStream.on('finish', () => {
          fileStream.close()
          console.log(`\nDownloaded and saved: ${localPath}`)
          resolve(true)
        })

        // Handle errors
        fileStream.on('error', (err) => {
          console.error(`\nFailed to save file: ${err.message}`)
          resolve(false)
        })


      } catch (err) {
        console.error(`\nFailed to download image: ${err.message}`)
        resolve(false)
      }
    });
  })
}


let countSuccess = 0
let countFail = 0
const faillist = []

// Download all images
// I just make sure it downloaded 1 by 1 because my connection is not very good,
for (let i = 0; i < images.length; i++) {
  const imageUrl = images[i]
  const localPath = urlToLocalPath(imageUrl, baseLocalDir);
  console.log('--------------------')
  console.log('starting download '+ (i + 1) + ' of ' + images.length)
  const res = await downloadImage(imageUrl, localPath);
  if (res) {
    countSuccess++
  } else {
    countFail++
    faillist.push(imageUrl)
  }
}

// The result here, with status to make sure if fail you can fix it manually more easily
console.log('--------------------')
console.log(`Total: ${images.length}, success: ${countSuccess}, Fail: ${countFail}`)
console.log(faillist)

// well, some template is not so good using this, sometime the image take soo much time to load,
// when I check manually it's just show 404 page, but it count as success with this code. 
// So make sure to double check, 
