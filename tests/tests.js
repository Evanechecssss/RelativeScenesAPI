/**
 * <RELATIVE SCENES API>
 * <VERSION: 1.0>
 * <Git: https://github.com/Evanechecssss/RelativeScenesAPI>
 *
 * Author: ⚘'Ivan'⚘
 * License: GNU General Public License v3
 * Thanks:
 * - McHorse for his mods
 * - Creman for help with trigonometry
 * - Oshi for everything
 */

var Integer = Java.type("java.lang.Integer");
var Math = Java.type("java.lang.Math");
var Vector3f = Java.type("javax.vecmath.Vector3f");
var Vector2f = Java.type("javax.vecmath.Vector2f");
var CommandRecord = Java.type("mchorse.blockbuster.commands.CommandRecord");
var RecordUtils = Java.type("mchorse.blockbuster.recording.RecordUtils");
var BBCommonProxy = Java.type("mchorse.blockbuster.CommonProxy");
var BBClientProxy = Java.type("mchorse.blockbuster.ClientProxy");
var Scene = Java.type("mchorse.blockbuster.recording.scene.Scene");
var Replay = Java.type("mchorse.blockbuster.recording.scene.Replay");
var AffineTransform = Java.type("java.awt.geom.AffineTransform");
var Point2D = Java.type("java.awt.geom.Point2D$Double");

function main(c) {
    var subject = c.getSubject();
    var world = subject.getWorld().getMinecraftWorld();

    var scene_name = "t"
    var scene_name2 = "t2"

    runThread(function () {
        DuplicateScene(scene_name, scene_name2, world);
        ChangeScene(c,scene_name2, scene_name2, world, AtanizeScene, {side:1})
        //RotateScene(scene_name2,scene_name2,world,90)
        PlayScene(scene_name2, world, 0)
        java.lang.Thread.sleep(100)
        DeleteScene(scene_name2, world)
    })
}

/**
 * @param {java.lang.String} name
 * @param {net.minecraft.world.World} world
 * @param {java.lang.Integer} ticks
 */
function PlayScene(name, world, ticks) {
    var scene = BBCommonProxy.scenes.get(name, world);
    scene.startPlayback(ticks);
}

/**
 * @param {java.lang.String} scene_name
 * @param {java.lang.String} save_name
 * @param {net.minecraft.world.World} world
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
 * @param {java.lang.String} scene_name
 * @param {net.minecraft.world.World} world
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
 * @param {java.lang.String} origin_scene_name
 * @param {java.lang.String} saved_scene_name
 * @param {net.minecraft.world.World} world
 * @param {java.awt.geom.AffineTransform} affine
 * @param {java.lang.Integer} yaw
 */
function AffineScene(origin_scene_name, saved_scene_name, world, affine, yaw) {
    yaw = yaw === undefined ? 0 : yaw;
    affine = affine === undefined ? new AffineTransform() : affine;
    var origin_records = new java.util.ArrayList();
    var sceneCenter = new Vector3f();
    var count = 0;

    processScene(BBCommonProxy.scenes.get(origin_scene_name, world), origin_records, true);

    if (count > 0) {
        sceneCenter.scale(1.0 / count);
    }

    processScene(BBCommonProxy.scenes.get(saved_scene_name, world), origin_records, false);

    function processScene(scene, originList, isOrigin) {
        var sceneActors = scene.actors;
        var emptyActors = sceneActors.isEmpty();

        if (emptyActors) {
            collectActors(scene);
        }

        var actorsList = new java.util.ArrayList(sceneActors.entrySet());
        for (var i = 0; i < actorsList.size(); i++) {
            var entry = actorsList.get(i);
            var record = entry.getValue().record;

            if (isOrigin) {
                handleOriginRecord(record, originList, sceneCenter);
            } else {
                transformRecord(originList.get(i), record, sceneCenter, affine, yaw);
            }
        }

        if (emptyActors) {
            clearActors(scene);
        }
    }

    function handleOriginRecord(record, originList, sceneCenter) {
        var clonedRecord = record.clone();
        originList.add(clonedRecord);
        var firstFrame = clonedRecord.frames.get(0);

        if (firstFrame) {
            sceneCenter.add(new Vector3f(firstFrame.x, firstFrame.y, firstFrame.z));
            count++;
        }
    }

    function transformRecord(origin_record, target_record, sceneCenter, affine, yaw) {
        if (!origin_record) return;

        transformFrames(origin_record.frames, sceneCenter, affine, yaw);
        transformActions(origin_record.actions, sceneCenter, yaw);

        origin_record.filename = target_record.filename;
        origin_record.save(RecordUtils.replayFile(origin_record.filename));
        BBCommonProxy.manager.records.put(origin_record.filename, origin_record);
    }

    function transformFrames(frames, sceneCenter, affine, yaw) {
        for (var j = 0; j < frames.size(); j++) {
            var frame = frames.get(j);
            var position = new Vector3f(frame.x, frame.y, frame.z);
            position.sub(sceneCenter);

            var point2d = new Point2D(position.x, position.z);
            affine.transform(point2d, point2d);

            frame.x = point2d.x + sceneCenter.x;
            frame.y = position.y + sceneCenter.y;
            frame.z = point2d.y + sceneCenter.z;

            frame.yaw = normalizeAngle(frame.yaw + yaw);
            frame.yawHead = normalizeAngle(frame.yawHead + yaw);

            if (frame.hasBodyYaw) {
                frame.bodyYaw = normalizeAngle(frame.bodyYaw + yaw);
            }
        }
    }

    function transformActions(actions, sceneCenter, yaw) {
        for (var j = 0; j < actions.size(); j++) {
            var actionList = actions.get(j);
            if (actionList != null && !actionList.isEmpty()) {
                for (var k = 0; k < actionList.size(); k++) {
                    var action = actionList.get(k);
                    action.changeOrigin(
                        yaw,
                        sceneCenter.x, sceneCenter.y, sceneCenter.z,
                        sceneCenter.x, sceneCenter.y, sceneCenter.z
                    );
                }
            }
        }
    }
}

/**
 * @param {java.lang.String} originName
 * @param {java.lang.String} saveName
 * @param {net.minecraft.world.World} world
 * @param {java.lang.Integer} degrees
 */
function RotateScene(originName,saveName, world, degrees)
{
    var rotation = new AffineTransform();
    rotation.rotate(Math.toRadians(degrees));
    AffineScene(originName, saveName, world, rotation, degrees);
}

/**
 * @param {java.lang.String} originName
 * @param {java.lang.String} saveName
 * @param {net.minecraft.world.World} world
 * @param dx
 * @param dz
 */
function TranslateScene(originName, saveName, world, dx, dz) {
    var affine = new AffineTransform();
    affine.translate(dx, dz);
    AffineScene(originName, saveName, world, affine, 0);
}
/**
 *
 * @param {java.lang.String} originName
 * @param {java.lang.String} saveName
 * @param {net.minecraft.world.World} world
 * @param {java.lang.Integer} targetAngle
 */
function AtanizeScene(originName, saveName, world, targetAngle) {
    var scene = BBCommonProxy.scenes.get(originName, world);

    var dominantAngle = findDominantSceneAngle(scene);

    var alignAngle = -dominantAngle;

    RotateScene(originName, saveName, world, alignAngle + targetAngle);
}

function findDominantSceneAngle(scene) {
    var vectors = new java.util.ArrayList();

    var actorsList = new java.util.ArrayList(scene.actors.entrySet());
    for (var i = 0; i < actorsList.size(); i++) {
        var entry = actorsList.get(i);
        var record = entry.getValue().record;

        if (record.frames.size() > 1) {
            var firstFrame = record.frames.get(0);
            var lastFrame = record.frames.get(record.frames.size() - 1);

            var dx = lastFrame.x - firstFrame.x;
            var dz = lastFrame.z - firstFrame.z;

            if (Math.sqrt(dx * dx + dz * dz) > 0.1) {
                var angle = Math.atan2(dx, dz) * 180 / Math.PI;
                vectors.add(angle);
            }
        }

        if (record.frames.size() > 0) {
            var firstFrame = record.frames.get(0);
            vectors.add(firstFrame.yaw);
        }
    }

    if (vectors.isEmpty()) return 0;

    return calculateCircularAverage(vectors);
}

function calculateCircularAverage(angles) {
    var sumSin = 0;
    var sumCos = 0;

    for (var i = 0; i < angles.size(); i++) {
        var angle = angles.get(i);
        var rad = angle * Math.PI / 180;
        sumSin += Math.sin(rad);
        sumCos += Math.cos(rad);
    }

    var avgSin = sumSin / angles.size();
    var avgCos = sumCos / angles.size();

    return Math.atan2(avgSin, avgCos) * 180 / Math.PI;
}
//@Utils

function clearActors(scene) {
    scene.actors.clear();
    scene.actorsCount = 0;
}

function collectActors(scene) {
    var method = Scene.class.getDeclaredMethod("collectActors", [Replay.class]);
    method.setAccessible(true);
    method.invoke(scene, null);
    method.setAccessible(false);
}

function normalizeAngle(angle) {
    angle = angle % 360;
    if (angle > 180) {
        angle -= 360;
    } else if (angle < -180) {
        angle += 360;
    }
    return angle;
}

function setRootPoint(root, point)
{
    if (root == null)
    {
        root = new Vector3f(point.x, point.y, point.z);
    }
    return root;
}

function runThread(runnable)
{(new (Java.extend(java.lang.Thread, {run: runnable}))()).start();}


//@Deprecated

/**
 * Changes the scene and saves it.
 * Changes are made by accepting a function.
 * You can override your function with the desired signature.
 * Example: function(frames, actions, parameter){return [frames, actions];}
 *
 * @param {java.lang.String} scene_name
 * @param {java.lang.String} save_name
 * @param {net.minecraft.world.World} world
 * @param {java.lang.Function} fun
 * @param {java.lang.Object} params
 */
function ChangeScene(c,scene_name, save_name, world, fun, params) {
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
                var result = fun(c,origin_frames, origin_actions, params);
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
 * Move the scene by a vector and rotates it by degrees
 * @param {java.util.ArrayList} frames
 * @param {java.util.ArrayList} actions
 * @param {java.lang.Object} params {yaw: value, position: value}
 * @returns Array of changed frames and actions
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

function AtanizeScene2(c, frames, actions, params) {
    var root = null;
    var i = 0;
    var theta_degrees = null;
    var theta = null;

    if (params.calculatedAngle === undefined) {
        var firstFrame = frames.get(0);
        root = new Vector3f(firstFrame.x, firstFrame.y, firstFrame.z);

        var maxDistance = -1;
        var targetPoint = null;

        for (var j = 0; j < frames.size(); j++) {
            var frame = frames.get(j);
            var point = new Vector3f(frame.x, frame.y, frame.z);
            var distance = point.distance(root);

            if (distance > maxDistance && !root.equals(point)) {
                maxDistance = distance;
                targetPoint = point;
            }
        }

        if (targetPoint !== null) {
            var delta = new Vector3f(targetPoint.x - root.x, targetPoint.y - root.y, targetPoint.z - root.z);
            var n_delta = new Vector2f(Math.abs(delta.x), delta.z);
            var axle = new Vector2f(0, 1);
            n_delta.normalize();

            if (delta.x < 0) {
                params.side = -1;
            } else {
                params.side = 1;
            }

            theta = n_delta.angle(axle);
            theta_degrees = theta * 180 / Math.PI;
            params.calculatedAngle = theta_degrees;
            params.calculatedSide = params.side;
        }
    } else {
        theta_degrees = params.calculatedAngle;
        params.side = params.calculatedSide;
        theta = theta_degrees * Math.PI / 180;
    }

    for (var j = 0; j < frames.size(); j++) {
        var frame = frames.get(j);
        var point = new Vector3f(frame.x, frame.y, frame.z);

        if (i == 0 && root === null) {
            root = new Vector3f(point.x, point.y, point.z);
        }

        var delta = new Vector3f(point.x - root.x, point.y - root.y, point.z - root.z);

        var cos = Math.cos(theta);
        var sin = Math.sin(theta);
        var xx = delta.x * cos + (params.side * -1) * (delta.z * sin);
        var zz = (params.side) * delta.x * sin + delta.z * cos;

        delta.x = xx;
        delta.z = zz;

        frame.yaw += theta_degrees;
        frame.yawHead += theta_degrees;

        if (frame.hasBodyYaw) {
            frame.bodyYaw += theta_degrees;
        }

        frame.x = root.x + delta.x;
        frame.y = root.y + delta.y;
        frame.z = root.z + delta.z;
        i++;
    }

    for (var j = 0; j < actions.size(); j++) {
        var a_actions = actions.get(j);
        if (a_actions != null && !a_actions.isEmpty()) {
            for (var k = 0; k < a_actions.size(); k++) {
                var action = a_actions.get(k);
                action.changeOrigin(theta_degrees, root.x, root.y, root.z, root.x, root.y, root.z);
            }
        }
    }

    return [frames, actions];
}