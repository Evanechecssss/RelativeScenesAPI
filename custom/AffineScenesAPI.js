function AffineScene(origin_scene_name, saved_scene_name, world, affine, yaw)
{
    yaw = yaw===undefined ? 0 : yaw
    affine = affine===undefined ? new AffineTransform() : affine
    var origin_record;
    processScene(BBCommonProxy.scenes.get(origin_scene_name, world), null);
    processScene(BBCommonProxy.scenes.get(saved_scene_name, world), origin_record);

    function processScene(scene, origin)
    {
        var sceneActors = scene.actors;
        var emptyActors = sceneActors.isEmpty();
        if (emptyActors)
        {
            collectActors(scene);
        }
        var actorsIterator = sceneActors.entrySet().iterator();
        while (actorsIterator.hasNext()) {
            var entry = actorsIterator.next();
            var record = entry.getValue().record;
            if (origin == null)
            {
                origin_record = record.clone();
            }
            else
            {
                var frames = origin.frames;
                var actions = origin.actions;
                var frameIterator = frames.iterator();
                var root = new Vector3f(frames[0].x, frames[0].y, frames[0].z);
                while (frameIterator.hasNext())
                {
                    var frame = frameIterator.next();
                    var position = new Vector3f(frame.x, frame.y, frame.z);
                    affine.transform(position, 0, position, 0, 1);
                    frame.x = position[0];
                    frame.y = position[1];
                    frame.z = position[2];
                    frame.yaw += yaw;
                    frame.yawHead += yaw;
                    if (frame.hasBodyYaw) {
                        frame.bodyYaw += yaw;
                    }
                }
                var actionsFirstIterator = actions.iterator();
                while (actionsFirstIterator.hasNext())
                {
                    var actionsList = actionsFirstIterator.next();
                    if (actionsList == null || actionsList.isEmpty()) {
                        return;
                    }
                    var actionsIterator = actionsList.iterator();
                    while (actionsIterator.hasNext())
                    {
                        var action = actionsIterator.next();
                        action.changeOrigin(theta, root.x, root.y, root.z, root.x, root.y, root.z);
                    }
                }
                origin.frames = frames;
                origin.actions = actions;
                origin.filename = record.filename;
                origin.save(RecordUtils.replayFile(origin.filename));
                BBCommonProxy.manager.records.put(origin.filename, origin);
            }
        }
        if (emptyActors)
        {
            clearActors(scene);
        }
    }
}

function collectActors(scene)
{
    var method = Scene.class.getDeclaredMethod("collectActors", [Replay.class]);
    method.setAccessible(true);
    method.invoke(scene, null);
    method.setAccessible(false);
}

function clearActors(scene)
{
    scene.actors.clear();
    scene.actorsCount = 0;
}
