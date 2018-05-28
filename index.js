var fs = require('fs');
var path = require('path');
var packageLockPath = path.resolve(process.cwd(), 'npm-shrinkwrap.json');

if (!fs.existsSync(packageLockPath)) {
  return 0;
}

if (!fs.existsSync('node_modules')) {
  return 0;
}

var packageLock = require(packageLockPath);

function mountNewLockfile(lockfile, newLockfile) {
  if (!newLockfile) {
    newLockfile = {};
  }

  if (lockfile.dependencies) {
    Object.keys(lockfile.dependencies).forEach((dependency) => {
      var depObject = lockfile.dependencies[dependency];
      if (!depObject.optional || depObject.optional != true) {
        newLockfile[dependency] = depObject;

        if (depObject.dependencies) {
          newLockfile[dependency]['dependencies'] = mountNewLockfile(depObject);
        }
      } else {
        console.log('ignoring', dependency)
        // var dep = require(path.resolve(process.cwd(),`node_modules/${dependency}/package.json`))
        // dep._requiredBy.forEach((required) => {
        //   var requiredDep = require(path.resolve(process.cwd(),`node_modules${required}/package.json`));
        //   // requiredDep.optionalDependencies = {};
        //   var dependencyName = required.slice(1);
        //   if (requiredDep.dependencies && requiredDep.dependencies[dependencyName]) {
        //     delete requiredDep.dependencies[dependencyName];
        //   }
        //   if (requiredDep.devDependencies && requiredDep.devDependencies[dependencyName]) {
        //     delete requiredDep.devDependencies[dependencyName];
        //   }

        //   fs.writeFileSync(path.resolve(process.cwd(),`node_modules${required}/package.json`), JSON.stringify(requiredDep, null, 2));
        // })
      }
    })
  }

  return newLockfile;
};

function saveNewPackageLockfile(lockfileDependencies) {
  var newPackageLockJson = packageLock;
  newPackageLockJson.dependencies = lockfileDependencies;

  var lockfilePath = fs.writeFileSync(
    packageLockPath,
    JSON.stringify(newPackageLockJson, null, 2)
  );
}

saveNewPackageLockfile(mountNewLockfile(packageLock));
