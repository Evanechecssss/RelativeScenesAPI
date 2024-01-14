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

function MoveScene(frames, actions, params)
{
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

function setRootPoint(root, point)
{
    if (root == null)
    {
        root = new Vector3f(point.x, point.y, point.z);
    }
    return root;
}

function clearActors(scene)
{
    scene.actors.clear();
    scene.actorsCount = 0;
}

function collectActors(scene)
{
    var method = Scene.class.getDeclaredMethod("collectActors", [Replay.class]);
    method.setAccessible(true);
    method.invoke(scene, null);
    method.setAccessible(false);
}