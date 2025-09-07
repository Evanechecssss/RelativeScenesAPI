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

var Math = Java.type("java.lang.Math");
var Vector3f = Java.type("javax.vecmath.Vector3f");
var Matrix3f = Java.type("javax.vecmath.Matrix3f");
var Camera = Java.type("mchorse.aperture.capabilities.camera.Camera");
var CameraUtils = Java.type("mchorse.aperture.camera.CameraUtils");

/**
 * @param {java.lang.String} name
 * @param {net.minecraft.entity.player.EntityPlayer} player
 */
function RunCamera(name, player) {
    CameraUtils.sendProfileToPlayer(name, player, true, true);
}

function CameraMove(fixtures, params) {
    return FixturesMove(fixtures, params.x, params.y, params.z);
}

function CameraRotate(fixtures, params) {
    return FixturesRotate(fixtures, params.yaw, params.pitch);
}

function CameraCopy(fixtures, params) {
    return fixtures;
}

function ChangeCamera(profileName, saveName, fun, params) {
    var profile = JSON.parse(CameraUtils.readCameraProfile(profileName));
    var fixtures = profile.fixtures;
    profile.fixtures = fun(fixtures, params);
    CameraUtils.writeCameraProfile(saveName, JSON.stringify(profile, null, 2));
}

function RotatePoint(root, offset, yaw, pitch) {
    var point = new Vector3f(root);
    var vector = _rotate(offset, yaw, pitch);
    point.x += vector.x;
    point.y += vector.y;
    point.z += vector.z;
    return point;
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

function FixturesRotate(fixtures, yaw, pitch) {
    var root = null;
    var callback = [];
    for (var i = 0; i < fixtures.length; i++) {
        var fixture = fixtures[i];
        var points = extractPoints(fixture);
        for (var j = 0; j < points.length; j++) {
            var point = points[j];
            if (root != null) {
                var delta = new Vector3f(point.x - root.x, point.y - root.y, point.z - root.z);
                var rootv = new Vector3f(root.x, root.y, root.z);
                var rotated = RotatePoint(rootv, delta, yaw, pitch);
                point.x = rotated.x;
                point.y = rotated.y;
                point.z = rotated.z;
            }
            root = setRootPoint(root, point);
        }
        callback.push(insertPoints(fixture, points));
    }
    return callback;
}

function FixturesMove(fixtures, x, y, z) {
    var root = null;
    var callback = [];
    for (var i = 0; i < fixtures.length; i++) {
        var fixture = fixtures[i];
        var points = extractPoints(fixture);
        for (var j = 0; j < points.length; j++) {
            var point = points[j];
            root = setRootPoint(root, point);
            point.x = x + (point.x - root.x);
            point.y = y + (point.y - root.y);
            point.z = z + (point.z - root.z);
        }
        callback.push(insertPoints(fixture, points));
    }
    return callback;
}

function extractPoints(fixture) {
    var points = [];
    var type = fixture.type;

    if (type === "path") {
        for (var i = 0; i < fixture.points.length; i++) {
            var rawpoint = fixture.points[i];
            var point = rawpoint.point;
            points.push(new Vector3f(point.x, point.y, point.z));
        }
    } else if (type === "idle") {
        var point = fixture.position.point;
        points.push(new Vector3f(point.x, point.y, point.z));
    } else if (type === "circular") {
        var point = fixture.start;
        points.push(new Vector3f(point.x, point.y, point.z));
    } else if (type === "dolly") {
        var point = fixture.position.point;
        points.push(new Vector3f(point.x, point.y, point.z));
    }

    return points;
}

function insertPoints(fixture, points) {
    var type = fixture.type;

    if (type === "path") {
        for (var i = 0; i < fixture.points.length && i < points.length; i++) {
            fixture.points[i].point.x = points[i].x;
            fixture.points[i].point.y = points[i].y;
            fixture.points[i].point.z = points[i].z;
        }
    } else if (type === "idle") {
        fixture.position.point.x = points[0].x;
        fixture.position.point.y = points[0].y;
        fixture.position.point.z = points[0].z;
    } else if (type === "circular") {
        fixture.start.x = points[0].x;
        fixture.start.y = points[0].y;
        fixture.start.z = points[0].z;
    } else if (type === "dolly") {
        fixture.position.point.x = points[0].x;
        fixture.position.point.y = points[0].y;
        fixture.position.point.z = points[0].z;
    }

    return fixture;
}



function ClearCash(name, players) {
    for (var i in players) {
        var camera = Camera.get(players[i]);
        camera.setCurrentProfile(name);
        camera.setCurrentProfileTimestamp(-1);
        CameraUtils.sendProfileToPlayer(name, players[i], false, false);
    }
}

function setRootPoint(root, point) {
    if (root == null) {
        root = new Vector3f(point.x, point.y, point.z);
    }
    return root;
}