import Joi from 'joi';

export const userValidation = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  email: Joi.string().trim().lowercase().min(5).max(200).required().email(),
  password: Joi.string().trim().min(6).max(100).required(),
  role: Joi.string().valid('admin', 'manager', 'employee').optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
  managerId: Joi.string().optional().allow('', null)
}).unknown(true);


export const taskValidation = Joi.object({
  title: Joi.string().required().max(200),
  description: Joi.string().max(1000).optional().allow(''),
  status: Joi.string().valid('Pending', 'In Progress', 'Completed').optional(),
  priority: Joi.string().valid('Low', 'Medium', 'High').optional(),
  assignedTo: Joi.string().optional().allow(null, ''),
  managerId: Joi.string().optional().allow(null, ''),
  createdBy: Joi.string().optional(),
  dueDate: Joi.date().optional()
});


export const announcementValidation = Joi.object({
  title: Joi.string().required().max(200),
  message: Joi.string().required(),
  type: Joi.string().valid('info', 'warning', 'success', 'error').optional(),
  targetRoles: Joi.array().items(Joi.string()).optional()
});

// Middleware wrappers
export const validateUser = (req, res, next) => {
  const { error } = userValidation.validate(req.body);
  if (error) {
    return res.status(400).json({
      code: 400,
      message: error.details[0].message,
      data: null
    });
  }
  next();
};

export const validateTask = (req, res, next) => {
  const { error } = taskValidation.validate(req.body);
  if (error) {
    return res.status(400).json({
      code: 400,
      message: error.details[0].message,
      data: null
    });
  }
  next();
};

export const validateAnnouncement = (req, res, next) => {
  const { error } = announcementValidation.validate(req.body);
  if (error) {
    return res.status(400).json({
      code: 400,
      message: error.details[0].message,
      data: null
    });
  }
  next();
};

