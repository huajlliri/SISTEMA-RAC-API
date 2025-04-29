const { AbilityBuilder, createMongoAbility } = require("@casl/ability");

function defineAbility(rol) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
  rol.Permissions.forEach((permiso) => {
    can(permiso.action, permiso.subject);
  });
  return build();
}

module.exports = defineAbility;
