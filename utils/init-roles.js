const Role = require('../models/role.model');

const roles = [
  {
    name: 'admin',
    description: 'Administrator with full system access',
    permissions: [
      'manage_users',
      'manage_roles',
      'approve_users',
      'reject_users',
      'view_all',
    ],
  },
  {
    name: 'captain',
    description: 'Yacht captain with vessel management capabilities',
    permissions: ['manage_vessel', 'view_crew', 'manage_crew', 'view_services'],
  },
  {
    name: 'service_provider',
    description: 'Provider of yacht-related services',
    permissions: ['manage_services', 'view_requests', 'respond_to_requests'],
  },
  {
    name: 'supplier',
    description: 'Supplier of yacht provisions and equipment',
    permissions: ['manage_inventory', 'view_orders', 'manage_orders'],
  },
  {
    name: 'crew_member',
    description: 'Yacht crew member',
    permissions: ['view_assignments', 'update_profile', 'view_schedule'],
  },
];

const initializeRoles = async () => {
  try {
    for (const role of roles) {
      await Role.findOneAndUpdate({ name: role.name }, role, {
        upsert: true,
        new: true,
      });
    }
    console.log('Roles initialized successfully');
  } catch (error) {
    console.error('Error initializing roles:', error);
  }
};

module.exports = initializeRoles;
