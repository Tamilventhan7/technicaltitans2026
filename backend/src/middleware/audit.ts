import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { AuditLog } from '../models';

export function auditLogger(resourceType: string, action: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (body: any): any {
      res.send = originalSend;
      originalSend.call(res, body);

      // Perform audit logging asynchronously post-response to avoid delay
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const performedBy = req.user?.id || 'ANONYMOUS';
        const resourceId = req.params.id || 'N/A';
        const ipAddress = req.ip || req.socket.remoteAddress;

        let parsedBody: any = null;
        try {
          parsedBody = JSON.parse(body);
        } catch {
          parsedBody = body;
        }

        AuditLog.create({
          id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          resourceType,
          resourceId,
          action,
          performedBy,
          newState: action === 'DELETE' ? null : parsedBody,
          ipAddress,
          isDeleted: false
        }).catch(err => {
          console.error('Failed to write Audit Log to DB:', err);
        });
      }

      return res;
    } as any;

    next();
  };
}
