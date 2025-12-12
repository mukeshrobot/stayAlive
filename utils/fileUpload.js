import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getFileUrl = (file) => {
  if (!file) return null;
  
  const folder = file.fieldname === 'profileImage' ? 'profiles' :
                 file.fieldname === 'postMedia' ? 'posts' :
                 file.fieldname === 'teamLogo' ? 'teams' :
                 file.fieldname === 'matchProof' ? 'matches' : 'general';
  
  return `/uploads/${folder}/${file.filename}`;
};

export const getFullPath = (file) => {
  if (!file) return null;
  
  const folder = file.fieldname === 'profileImage' ? 'profiles' :
                 file.fieldname === 'postMedia' ? 'posts' :
                 file.fieldname === 'teamLogo' ? 'teams' :
                 file.fieldname === 'matchProof' ? 'matches' : 'general';
  
  return path.join(__dirname, '../uploads', folder, file.filename);
};

