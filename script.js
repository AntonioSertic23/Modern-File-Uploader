// Selecting elements from the DOM
const fileList = document.querySelector(".file-list");
const fileBrowseButton = document.querySelector(".file-browse-button");
const fileBrowseInput = document.querySelector(".file-browse-input");
const fileUploadBox = document.querySelector(".file-upload-box");
const fileCompletedStatus = document.querySelector(".file-completed-status");

// Variables to track total and completed files
let totalFiles = 0;
let completedFiles = 0;

/**
 * Function to create HTML for each file item
 * @param {File} file - The file object
 * @param {number} uniqueIdentifier - Unique identifier for the file item
 * @returns {string} - HTML string for the file item
 */
const createFileItemHTML = (file, uniqueIdentifier) => {
  const { name, size } = file;
  const extension = name.split(".").pop();
  const formattedFileSize = size >= 1024 * 1024 ? `${(size / (1024 * 1024)).toFixed(2)} MB` : `${(size / 1024).toFixed(2)} KB`;

  return `<li class="file-item" id="file-item-${uniqueIdentifier}">
                <div class="file-extension">${extension}</div>
                <div class="file-content-wrapper">
                <div class="file-content">
                    <div class="file-details">
                    <h5 class="file-name">${name}</h5>
                    <div class="file-info">
                        <small class="file-size">0 MB / ${formattedFileSize}</small>
                        <small class="file-divider">•</small>
                        <small class="file-status">Uploading...</small>
                    </div>
                    </div>
                    <button class="cancel-button">
                    <i class="bx bx-x"></i>
                    </button>
                </div>
                <div class="file-progress-bar">
                    <div class="file-progress"></div>
                </div>
                </div>
            </li>`;
};

/**
 * Function to handle file uploading
 * @param {File} file - The file object
 * @param {number} uniqueIdentifier - Unique identifier for the file item
 * @returns {XMLHttpRequest} - The XMLHttpRequest object for the file upload
 */
const handleFileUploading = (file, uniqueIdentifier) => {
  const xhr = new XMLHttpRequest();
  const formData = new FormData();
  formData.append("file", file);

  // Adding progress event listener to the AJAX request
  xhr.upload.addEventListener("progress", (e) => {
    const fileProgress = document.querySelector(`#file-item-${uniqueIdentifier} .file-progress`);
    const fileSize = document.querySelector(`#file-item-${uniqueIdentifier} .file-size`);

    // Formatting the uploading or total file size into KB or MB accordingly
    const formattedFileSize =
      file.size >= 1024 * 1024 ? `${(e.loaded / (1024 * 1024)).toFixed(2)} MB / ${(e.total / (1024 * 1024)).toFixed(2)} MB` : `${(e.loaded / 1024).toFixed(2)} KB / ${(e.total / 1024).toFixed(2)} KB`;

    const progress = Math.round((e.loaded / e.total) * 100);
    fileProgress.style.width = `${progress}%`;
    fileSize.innerText = formattedFileSize;
  });

  // Opening connection to the server API endpoint "api.php" and sending the form data
  xhr.open("POST", "api.php", true);
  xhr.send(formData);

  return xhr;
};

/**
 * Function to handle selected files
 * @param {File[]} files - Array of file objects
 */
const handleSelectedFiles = ([...files]) => {
  if (files.length === 0) return; // Check if no files are selected
  totalFiles += files.length;

  files.forEach((file, index) => {
    const uniqueIdentifier = Date.now() + index;
    const fileItemHTML = createFileItemHTML(file, uniqueIdentifier);
    fileList.insertAdjacentHTML("afterbegin", fileItemHTML);
    const currentFileItem = document.querySelector(`#file-item-${uniqueIdentifier}`);
    const cancelFileUploadButton = currentFileItem.querySelector(".cancel-button");

    const xhr = handleFileUploading(file, uniqueIdentifier);

    // Update file status text and change color of it
    const updateFileStatus = (status, color) => {
      currentFileItem.querySelector(".file-status").innerText = status;
      currentFileItem.querySelector(".file-status").style.color = color;
    };

    // Event listener for state changes in the AJAX request
    xhr.addEventListener("readystatechange", () => {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        completedFiles++;
        cancelFileUploadButton.remove();
        updateFileStatus("Completed", "#42d392");
        fileCompletedStatus.innerText = `${completedFiles} / ${totalFiles} files completed`;
      }
    });

    // Handling cancellation of file upload
    cancelFileUploadButton.addEventListener("click", () => {
      xhr.abort(); // Cancel file upload
      updateFileStatus("Cancelled", "#e3413f");
      cancelFileUploadButton.remove();
    });

    // Show Alert if there is any error occurred during file uploading
    xhr.addEventListener("error", () => {
      updateFileStatus("Error", "#e3413f");
      alert("An error occurred during the file upload!");
    });
  });

  fileCompletedStatus.innerText = `${completedFiles} / ${totalFiles} files completed`;
};

// Function to handle file drop event
fileUploadBox.addEventListener("drop", (e) => {
  e.preventDefault();
  handleSelectedFiles(e.dataTransfer.files);
  fileUploadBox.classList.remove("active");
  fileUploadBox.querySelector(".file-instruction").innerText = "Drag files here or";
});

// Function to handle file dragover event
fileUploadBox.addEventListener("dragover", (e) => {
  e.preventDefault();
  fileUploadBox.classList.add("active");
  fileUploadBox.querySelector(".file-instruction").innerText = "Release to upload or";
});

// Function to handle file dragleave event
fileUploadBox.addEventListener("dragleave", (e) => {
  e.preventDefault();
  fileUploadBox.classList.remove("active");
  fileUploadBox.querySelector(".file-instruction").innerText = "Drag files here or";
});

// Event listener for file input change event
fileBrowseInput.addEventListener("change", (e) => handleSelectedFiles(e.target.files));
// Event listener for browse button click event
fileBrowseButton.addEventListener("click", () => fileBrowseInput.click());
