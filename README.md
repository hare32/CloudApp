# CloudApp
Web app for SPC

## Overview
This project is a web-based file management system that enables users to securely register and login to upload, download, and manage their files online. It provides a convenient dashboard for users to interact with their files, supporting individual file uploads, bulk uploads via zip files, and file downloads. The system includes a robust back-end developed in Node.js, ensuring secure authentication and efficient file handling.

## Features
- **User Authentication:** Secure registration and login functionality.
- **File Upload:** Users can upload files individually or in bulk by creating a zip file.
- **File Download:** Users can download their files from the server.
- **File Management:** A dashboard for users to view a list of their uploaded files, with options to download or delete them.
- **File Versioning:** Implemented versioning for files, allowing users to access and download previous versions of their files.
- **Security:** Implements basic security features for user authentication and file management.

## Technologies Used
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js
- **Database:** SQLite
- **Cloud Storage:** Microsoft Azure Blob Storage for storing and managing user files and their versions.
- **Other Libraries:** JSZip for handling zip files, msal-browser.js for authentication.

## Usage

- **Register a New Account:** Navigate to the main page and fill out the registration form.
- **Login:** If you already have an account, use the login form to access your dashboard.
- **Upload Files:** In the dashboard, use the "Upload File" option to select and upload files. Files uploaded will be stored in Microsoft Azure Blob Storage.
- **Download Files:** View the list of uploaded files in the dashboard and use the download option as needed. Users can also download previous versions of their files if needed.
