function CameraMove(fixtures, params)
{
    return FixturesMove(fixtures, params.x, params.y, params.z);
}

function CameraRotate(fixtures, params)
{
    return FixturesRotate(fixtures, params.yaw, params.pitch);
}

function CameraCopy(fixtures, params)
{
    return fixtures;
}

function ChangeCamera(profileName, saveName, fun, params)
{
    var profile = JSON.parse(CameraUtils.readCameraProfile(profileName));
    var fixtures = profile.fixtures;
    profile.fixtures = fun(fixtures, params);
    CameraUtils.writeCameraProfile(saveName, JSON.stringify(profile, null, 2));
}

function RotatePoint(root, offset, yaw, pitch)
{
    var point = new Vector3f(root);
    var vector = _rotate(offset, yaw, pitch);
    point.x += vector.x;
    point.y += vector.y;
    point.z += vector.z;
    return point;
}

function _rotate(vector, yaw, pitch)
{
    var a = new Matrix3f();
    var b = new Matrix3f();
    a.rotY(yaw / 180 * Math.PI);
    b.rotX(pitch / 180 * Math.PI);
    a.mul(b);
    a.transform(vector);
    return vector;
}

function FixturesRotate(fixtures, yaw, pitch)
{
    var root = null;
    var callback = [];
    fixtures.forEach(function (fixture)
    {
        var points = extractPoints(fixture);
        points.forEach(function (point)
        {
            if (root != null)
            {
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

function FixturesMove(fixtures, x, y, z)
{
    var root = null;
    var callback = [];
    fixtures.forEach(function (fixture)
    {
        var points = extractPoints(fixture);
        points.forEach(function (point)
        {
            root = setRootPoint(root, point);
            point.x = x + (point.x - root.x);
            point.y = y + (point.y - root.y);
            point.z = z + (point.z - root.z);
        })
        callback.push(insertPoints(fixture, points));
    })
    return callback;
}

function extractPoints(fixture)
{
    var points = [];
    var ficturesFunctions = {
            path: function ()
            {
                fixture.points.forEach(function (rawpoint)
                {
                    var point = rawpoint.point;
                    points.push(new Vector3f(point.x, point.y, point.z));
                })
                return points;
            },
            idle: function ()
            {
                var point = fixture.position.point;
                points.push(new Vector3f(point.x, point.y, point.z));
                return points;
            },
            circular: function ()
            {
                var point = fixture.start;
                points.push(new Vector3f(point.x, point.y, point.z));
                return points;
            },
            dolly: function ()
            {
                return idle();
            },
            null: function ()
            {
                return points;
            },
            manual: function ()
            {
                return points;
            },
            keyframe: function ()
            {
                return points;
            }
        }
    return ficturesFunctions[fixture.type]();
}

function insertPoints(fixture, points)
{
    var ficturesFunctions = {
        path: function ()
        {
            for (var p in fixture.points)
            {
                fixture.points[p].point.x = points[p].x;
                fixture.points[p].point.y = points[p].y;
                fixture.points[p].point.z = points[p].z;
            }
            return fixture;
        },
        idle: function ()
        {
            fixture.position.point.x = points.x;
            fixture.position.point.y = points.y;
            fixture.position.point.z = points.z;
            return fixture;
        },
        circular: function ()
        {
            fixture.start.x = points.x;
            fixture.start.y = points.y;
            fixture.start.z = points.z;
            return fixture;
        },
        dolly: function ()
        {
            return idle();
        },
        null: function ()
        {
            return points;
        },
        manual: function ()
        {
            return points;
        },
        keyframe: function ()
        {
            return points;
        }
    }
    return ficturesFunctions[fixture.type]();
}