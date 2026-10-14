/**
 * Adopts the UIKit scene life cycle, which the iOS 27 SDK requires at launch.
 *
 * Expo SDK 57 already ships `ExpoAppSceneDelegate`, but its prebuild template
 * still uses the app-delegate window. This backports the SDK 58 template:
 * a `SceneDelegate`, the scene manifest in Info.plist, and an AppDelegate that
 * leaves window creation to the scene.
 */
const { IOSConfig, withDangerousMod, withInfoPlist, withXcodeProject } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const SCENE_DELEGATE = `internal import Expo

@objc(SceneDelegate)
class SceneDelegate: ExpoAppSceneDelegate {
  // Extension point for config plugins.
}
`;

function withSceneManifest(config) {
  return withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };
    return cfg;
  });
}

function withSceneFiles(config) {
  return withDangerousMod(config, [
    'ios',
    (cfg) => {
      const projectName = IOSConfig.XcodeUtils.getProjectName(cfg.modRequest.projectRoot);
      const dir = path.join(cfg.modRequest.platformProjectRoot, projectName);
      fs.writeFileSync(path.join(dir, 'SceneDelegate.swift'), SCENE_DELEGATE);

      const appDelegatePath = path.join(dir, 'AppDelegate.swift');
      let src = fs.readFileSync(appDelegatePath, 'utf8');
      src = src.replace(
        /class AppDelegate: ExpoAppDelegate \{/,
        'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {'
      );
      src = src.replace(
        /#if os\(iOS\) \|\| os\(tvOS\)\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)[\s\S]*?#endif\n/,
        '// The window is created and React Native is started by `SceneDelegate`.\n'
      );
      fs.writeFileSync(appDelegatePath, src);
      return cfg;
    },
  ]);
}

function withSceneInProject(config) {
  return withXcodeProject(config, (cfg) => {
    const projectName = IOSConfig.XcodeUtils.getProjectName(cfg.modRequest.projectRoot);
    const filepath = `${projectName}/SceneDelegate.swift`;
    if (!cfg.modResults.hasFile(filepath)) {
      IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
        filepath,
        groupName: projectName,
        project: cfg.modResults,
      });
    }
    return cfg;
  });
}

module.exports = (config) => withSceneInProject(withSceneFiles(withSceneManifest(config)));
