import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; name?: string };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized role' });
    }
    next();
  };
};

export const checkCaregiverAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const patientId = req.params.patientId || req.params.id; // Usually in route params
    if (!patientId) return res.status(400).json({ success: false, message: 'Patient ID missing' });

    // We dynamically import to prevent circular dependency
    const CaregiverLink = (await import('../modules/caregiver/caregiver-link.model')).default;
    
    // Check if the current user (caregiver) has an ACCEPTED link with the patient
    const link = await CaregiverLink.findOne({
      caregiverId: req.user!.id,
      patientId: patientId,
      status: 'ACCEPTED'
    });

    if (!link) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this patient\'s data' });
    }

    // Optionally add the link to the request if needed downstream
    (req as any).caregiverLink = link;

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error while checking access' });
  }
};
