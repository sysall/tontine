// Version comes from package.json so an installed build maps back to its tag.
// Store versions have to be plain x.y.z, so 1.2.0-alpha.3 ships as 1.2.0 and the
// full string stays in extra.releaseVersion. Everything else comes from app.json.
const { version } = require('./package.json');

module.exports = ({ config }) => ({
  ...config,
  version: version.split('-')[0],
  extra: {
    ...config.extra,
    releaseVersion: version,
  },
});
