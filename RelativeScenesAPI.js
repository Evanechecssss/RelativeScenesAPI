/**
 * <RELATIVE SCENES API>
 * <Git: https://github.com/Evanechecssss/CNPCSRelativeScenesAPI>
 *
 * Author: ⚘'Ivan'⚘ (Evanechecssss)
 * License: GNU General Public License v3
 * Thanks:
 * - McHorse for his mods
 * - Creman for help with trigonometry
 * - Oshi for everything
 */

/**
 * @DEPRECATED
 */

var Math = Java.type("java.lang.Math");
var Integer = Java.type("java.lang.Integer");
var Vector3f = Java.type("javax.vecmath.Vector3f");
var Matrix3f = Java.type("javax.vecmath.Matrix3f");
var CommandRecord = Java.type("mchorse.blockbuster.commands.CommandRecord");
var RecordUtils = Java.type("mchorse.blockbuster.recording.RecordUtils");
var BBCommonProxy = Java.type("mchorse.blockbuster.CommonProxy");
var BBClientProxy = Java.type("mchorse.blockbuster.ClientProxy");
var Scene = Java.type("mchorse.blockbuster.recording.scene.Scene");
var Replay = Java.type("mchorse.blockbuster.recording.scene.Replay");
var Camera = Java.type("mchorse.aperture.capabilities.camera.Camera");
var CameraUtils = Java.type("mchorse.aperture.camera.CameraUtils");
var CNPSAPI = Java.type("noppes.npcs.api.NpcAPI").Instance();

function test(e) {
    var player = e.player;
    var world = player.world.getMCWorld();
    var player_position = new Vector3f(player.x, player.y, player.z);
    var player_yaw = player.getMCEntity().rotationYaw + 90;
    var camera_yaw = player.getMCEntity().rotationYaw * -1 - 180;
    var camera_pitch = player.getMCEntity().rotationPitch * -1
    var camera_position = new Vector3f(player.x, player.y + 1.5, player.z);
    var scene_name = "scene"
    var scene_name2 = "scene_copy"
    var camera_name = "profile"
    var camera_name2 = "profile_two"

    DuplicateScene(scene_name, scene_name2, world);
    // ^--- Duplicate the scene (scene_name) and save it as (save_name).
    DeleteScene(scene_name2, world);
    // ^---Deletes the scene (scene_name2).
    ChangeScene(scene_name, scene_name2, world, MoveScene, {position: player_position, yaw: player_yaw})
    // ^--- Move the scene (scene_name) along a vector ({position}).
    // Rotates it ({yaw}) degrees. 
    // Saves the changes as a scene (scene_name2).
    PlayScene(scene_name2, world, 0);
    // ^--- Plays the scene (scene_name2) from 0 ticks.
    ChangeCamera(camera_name, camera_name2, CameraCopy, null);
    // ^--- Copy the camera profile (camera_name).
    // Saves it as a profile (camera_name2).
    ChangeCamera(camera_name2, camera_name, CameraRotate, {yaw: camera_yaw, pitch: camera_pitch});
    // ^--- Rotate the camera profile (camera_name2) at ({yaw}) degrees on the Y axis.
    // Rotate ar ({pitch}) degrees on the X axis. 
    // Saves as a camera profile (camera_name).
    ChangeCamera(camera_name, camera_name, CameraMove, camera_position);
    // ^--- Move the camera profile (camera_name) along a vector (camera_position).
    // Saves as a camera profile (camera_name).
    ClearCash(camera_name);
    // ^--- Necessary to update camera profiles without quitting the game. 
    // It is desirable to perform at the end of operations on the camera.
}

/**
 * Plays the scene from the tick
 * @param {string} name Name of scene
 * @param {World} world Minecraft World
 * @param {int} ticks Ticks
 */
function PlayScene(name, world, ticks) {
    var scene = BBCommonProxy.scenes.get(name, world);
    scene.startPlayback(ticks);
}

/**
 * Makes a copy of the scene
 * @param {string} scene_name
 * @param {string} save_name
 * @param {World} world
 */
function DuplicateScene(scene_name, save_name, world) {
    var origin = BBCommonProxy.scenes.get(scene_name, world);
    var scene = new Scene();
    scene.copy(origin);
    scene.setId(save_name);
    scene.setupIds();
    //renamePrefix(save_name) <--use on old bb versions
    scene.renamePrefix(origin.getId(), scene.getId(), function (id) {
        return save_name
    });
    for (var i = 0; i < scene.replays.size(); i++) {
        var replaySource = origin.replays.get(i);
        var replayDestination = scene.replays.get(i);
        var counter = 0;
        try {
            var record = CommandRecord.getRecord(replaySource.id).clone();
            if (RecordUtils.isReplayExists(replayDestination.id)) {
                continue;
            }
            record.filename = replayDestination.id + ((counter != 0) ? "_" + Integer.toString(counter) : "");
            replayDestination.id = record.filename;
            record.save(RecordUtils.replayFile(record.filename));
            CommonProxy.manager.records.put(record.filename, record);
        } catch (e) {
            e.printStackTrace();
        }
    }
    var scene = BBCommonProxy.scenes.save(save_name, scene);
    BBClientProxy.manager.reset();
}

/**
 * Deletes the scene
 * @param {string} scene_name
 * @param {World} world
 */
function DeleteScene(scene_name, world) {
    var scene = BBCommonProxy.scenes.get(scene_name, world);
    for (var i = 0; i < scene.replays.size(); i++) {
        var replaySource = scene.replays.get(i);
        try {
            var record = CommandRecord.getRecord(replaySource.id);
            RecordUtils.replayFile(record.filename).delete();
            RecordUtils.unloadRecord(BBCommonProxy.manager.records.get(record.filename));
            BBCommonProxy.manager.records.remove(record.filename);
        } catch (e) {
            e.printStackTrace();
        }
    }
    BBCommonProxy.scenes.remove(scene_name);
}

/**
 * Run camera profile for player
 * @param {string} name
 * @param {EntityPlayer} player
 */
function RunCamera(name, player) {
    CameraUtils.sendProfileToPlayer(name, player.getMCEntity(), true, true);
}

/**
 * Changes the scene and saves it.
 * Changes are made by accepting a function.
 * You can override your function with the desired signature.
 * Example: function(frames, actions, parameter){return [frames, actions];}
 * @param {string} scene_name
 * @param {string} save_name
 * @param {World} world
 * @param {function} fun
 * Signature: frames, actions, object parameter.
 * Return: array where 0-element is frames, 1-element is actions
 * @param {object} params Object
 */
function ChangeScene(scene_name, save_name, world, fun, params) {
    var origin_record;

    function aply(name, origin) {
        var scene = BBCommonProxy.scenes.get(name, world);
        var hasntactors = scene.actors.isEmpty();
        if (hasntactors) {
            collectActors(scene);
        }
        scene.actors.entrySet().forEach(function (entry) {
            if (origin == null) {
                var record = entry.getValue().record;
                origin_record = record.clone();
            } else {
                var record = entry.getValue().record;
                var record_name = record.filename;
                var origin_frames = origin.frames;
                var origin_actions = origin.actions;
                var result = fun(origin_frames, origin_actions, params);
                origin.frames = result[0];
                origin.actions = result[1];
                origin.filename = record_name;
                origin.save(RecordUtils.replayFile(origin.filename));
                BBCommonProxy.manager.records.put(origin.filename, origin);
            }
        });
        if (hasntactors) {
            clearActors(scene);
        }
    }

    aply(scene_name, null);
    aply(save_name, origin_record);
}

/**
 * Move camera by coordinates
 * @param {array} fixtures
 * @param {object} params
 * @returns array of fixtures
 */
function CameraMove(fixtures, params) {
    return FixturesMove(fixtures, params.x, params.y, params.z);
}

/**
 * Rotate camera by degrees
 * @param {array} fixtures
 * @param {object} params
 * @returns array of fixtures
 */
function CameraRotate(fixtures, params) {
    return FixturesRotate(fixtures, params.yaw, params.pitch);
}

/**
 * Make a copy of camera
 * @param {array} fixtures
 * @param {null} params
 * @returns array of fixtures
 */
function CameraCopy(fixtures, params) {
    return fixtures;
}

/**
 * Changes the camera and saves it.
 * Changes are made by accepting a function.
 * You can override your function with the desired signature.
 * Example: function(fixtures, params){return fixtures;}
 * @param {string} profileName
 * @param {string} saveName
 * @param {function} fun
 * Signature: fixtures, object parameter.
 * Return: array of fixtures
 * @param {object} params
 */
function ChangeCamera(profileName, saveName, fun, params) {
    var profile = JSON.parse(CameraUtils.readCameraProfile(profileName));
    var fixtures = profile.fixtures;
    profile.fixtures = fun(fixtures, params);
    CameraUtils.writeCameraProfile(saveName, JSON.stringify(profile, null, 2));
}

/**
 * Move the scene by a vector and rotates it by degrees
 * @param {array} frames
 * @param {array} actions
 * @param {object} params {yaw: value, position: value}
 * @returns array of changed frames and actions
 */
function MoveScene(frames, actions, params) {
    var root = null;
    var i = 0;
    var yaw = params.yaw;
    var position = params.position;
    frames.forEach(function (frame) {
        var point = new Vector3f(frame.x, frame.y, frame.z);
        if (i == 0) {
            root = setRootPoint(root, point);
        }
        var delta = new Vector3f(point.x - root.x, point.y - root.y, point.z - root.z);
        if (yaw != 0) {
            var cos = Math.cos(Math.toRadians(yaw));
            var sin = Math.sin(Math.toRadians(yaw));
            var xx = delta.x * cos - delta.z * sin;
            var zz = delta.x * sin + delta.z * cos;
            delta.x = xx;
            delta.z = zz;
            frame.yaw += yaw;
            frame.yawHead += yaw;
            if (frame.hasBodyYaw) {
                frame.bodyYaw += yaw;
            }
        }
        frame.x = (position == null ? root.x : position.x) + delta.x;
        frame.y = (position == null ? root.y : position.y) + delta.y;
        frame.z = (position == null ? root.z : position.z) + delta.z;
        i++;
    });
    actions.forEach(function (a_actions) {
        if (a_actions == null || a_actions.isEmpty()) {
            return;
        }
        a_actions.forEach(function (action) {
            action.changeOrigin(yaw, root.x, root.y, root.z, root.x, root.y, root.z);
        });
    });
    return [frames, actions];
}

/**
 * Clear camera cash
 * @param {string} name
 */
function ClearCash(name) {
    var players = CNPSAPI.getIWorld(0).getAllPlayers();
    for (var i in players) {
        var camera = Camera.get(players[i].getMCEntity());
        camera.setCurrentProfile(name);
        camera.setCurrentProfileTimestamp(-1);
        CameraUtils.sendProfileToPlayer(name, players[i].getMCEntity(), false, false);
    }
}

function setRootPoint(root, point) {
    if (root == null) {
        root = new Vector3f(point.x, point.y, point.z);
    }
    return root;
}

function clearActors(scene) {
    scene.actors.clear();
    scene.actorsCount = 0;
}

function RotatePoint(root, offset, yaw, pitch) {
    var point = new Vector3f(root);
    var vector = _rotate(offset, yaw, pitch);
    point.x += vector.x;
    point.y += vector.y;
    point.z += vector.z;
    return point;
}

function collectActors(scene) {
    var method = Scene.class.getDeclaredMethod("collectActors", [Replay.class]);
    method.setAccessible(true);
    method.invoke(scene, null);
    method.setAccessible(false);
}

function FixturesRotate(fixtures, yaw, pitch) {
    var root = null;
    var callback = [];
    fixtures.forEach(function (fixture) {
        var points = extractPoints(fixture);
        points.forEach(function (point) {
            if (root != null) {
                var delta = new Vector3f(point.x - root.x, point.y - root.y, point.z - root.z);
                var rootv = new Vector3f(root.x, root.y, root.z);
                var rotated = RotatePoint(rootv, delta, yaw, pitch);
                point.x = rotated.x;
                point.y = rotated.y;
                point.z = rotated.z;
            }
            root = setRootPoint(root, point);
        });
        callback.push(insertPoints(fixture, points));
    });
    return callback;
}

function FixturesMove(fixtures, x, y, z) {
    var root = null;
    var callback = [];
    fixtures.forEach(function (fixture) {
        var points = extractPoints(fixture);
        points.forEach(function (point) {
            root = setRootPoint(root, point);
            point.x = x + (point.x - root.x);
            point.y = y + (point.y - root.y);
            point.z = z + (point.z - root.z);
        })
        callback.push(insertPoints(fixture, points));
    })
    return callback;
}

function _rotate(vector, yaw, pitch) {
    var a = new Matrix3f();
    var b = new Matrix3f();
    a.rotY(yaw / 180 * Math.PI);
    b.rotX(pitch / 180 * Math.PI);
    a.mul(b);
    a.transform(vector);
    return vector;
}

function extractPoints(fixture) {
    var points = [];
    var ficturesFunctions =
        {
            path: function () {
                fixture.points.forEach(function (rawpoint) {
                    var point = rawpoint.point;
                    points.push(new Vector3f(point.x, point.y, point.z));
                })
                return points;
            },
            idle: function () {
                var point = fixture.position.point;
                points.push(new Vector3f(point.x, point.y, point.z));
                return points;
            },
            circular: function () {
                var point = fixture.start;
                points.push(new Vector3f(point.x, point.y, point.z));
                return points;
            },
            dolly: function () {
                return idle();
            },
            null: function () {
                return points;
            },
            manual: function () {
                return points;
            },
            keyframe: function () {
                return points;
            }
        }
    return ficturesFunctions[fixture.type]();
}

function insertPoints(fixture, points) {
    var ficturesFunctions =
        {
            path: function () {
                for (var p in fixture.points) {
                    fixture.points[p].point.x = points[p].x;
                    fixture.points[p].point.y = points[p].y;
                    fixture.points[p].point.z = points[p].z;
                }
                return fixture;
            },
            idle: function () {
                fixture.position.point.x = points.x;
                fixture.position.point.y = points.y;
                fixture.position.point.z = points.z;
                return fixture;
            },
            circular: function () {
                fixture.start.x = points.x;
                fixture.start.y = points.y;
                fixture.start.z = points.z;
                return fixture;
            },
            dolly: function () {
                return idle();
            },
            null: function () {
                return points;
            },
            manual: function () {
                return points;
            },
            keyframe: function () {
                return points;
            }
        }
    return ficturesFunctions[fixture.type]();
}
