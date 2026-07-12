import { Request, Response, NextFunction } from 'express';

// Recursively sanitize strings to strip script tags and basic HTML injections
function sanitizeValue(val: any): any {
  if (typeof val === 'string') {
    return val
      .replace(/<script[^>]*>([\S\s]*?)<\/script>/gi, '')
      .replace(/<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)*\s*\/?)?>/gi, '');
  } else if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  } else if (typeof val === 'object' && val !== null) {
    const clean: any = {};
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        clean[key] = sanitizeValue(val[key]);
      }
    }
    return clean;
  }
  return val;
}

export function xssSanitizer(req: Request, res: Response, next: NextFunction) {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
}
