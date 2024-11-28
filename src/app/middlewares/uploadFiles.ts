import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

// CONFIGURE FILE UPLOADER
const configureFileUpload = (fieldName: string, storageLocation: string) => {
  const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, storageLocation);
    },
    filename: (req, file, cb) => {
      const formattedFilename = `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`;
      cb(null, formattedFilename);
    },
  });

  return multer({
    storage: fileStorage,
  }).array(fieldName); // Use .single(), .array(), or .fields() as needed
};

// Middleware wrapper for dynamic configuration
const dynamicFileUpload = (fieldName: string, storageLocation: string) => {
  const upload = configureFileUpload(fieldName, storageLocation);

  return (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (err) => {
      // IF GOT ANY ERROR
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // FILE NAME FORMAT
      if (req.files) {
        req.files = req.files.map((file: any) => ({
          ...file,
          file: path.posix.join(
            storageLocation.replace(/^Images\//, ''), // Remove "Images/" prefix
            file.filename,
          ), // Normalize the path
        }));
      }

      next();
    });
  };
};
export default dynamicFileUpload;
