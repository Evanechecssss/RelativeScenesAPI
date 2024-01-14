function PlayScene(name, world, ticks)
{
    var scene = BBCommonProxy.scenes.get(name, world);
    scene.startPlayback(ticks);
}

function DuplicateScene(scene_name, save_name, world)
{
    var origin = BBCommonProxy.scenes.get(scene_name, world);
    var scene = new Scene();
    scene.copy(origin);
    scene.setId(save_name);
    scene.setupIds();
    //renamePrefix(save_name) <--use on old bb versions
    scene.renamePrefix(origin.getId(), scene.getId(), function (id) {return save_name});

    for (var i = 0; i < scene.replays.size(); i++)
    {
        var replaySource = origin.replays.get(i);
        var replayDestination = scene.replays.get(i);
        var counter = 0;

        try
        {
            var record = CommandRecord.getRecord(replaySource.id).clone();
            if (RecordUtils.isReplayExists(replayDestination.id))
            {
                continue;
            }
            record.filename = replayDestination.id + ((counter != 0) ? "_" + Integer.toString(counter) : "");
            replayDestination.id = record.filename;
            record.save(RecordUtils.replayFile(record.filename));
            CommonProxy.manager.records.put(record.filename, record);
        }
        catch (e)
        {
            e.printStackTrace();
        }
    }
    scene = BBCommonProxy.scenes.save(save_name, scene);
    BBClientProxy.manager.reset();
    return scene
}

function DeleteScene(scene_name, world)
{
    var scene = BBCommonProxy.scenes.get(scene_name, world);
    for (var i = 0; i < scene.replays.size(); i++)
    {
        var replaySource = scene.replays.get(i);
        try
        {
            var record = CommandRecord.getRecord(replaySource.id);
            RecordUtils.replayFile(record.filename).delete();
            RecordUtils.unloadRecord(BBCommonProxy.manager.records.get(record.filename));
            BBCommonProxy.manager.records.remove(record.filename);
        } catch (e)
        {
            e.printStackTrace();
        }
    }
    BBCommonProxy.scenes.remove(scene_name);
}

function RunCamera(name, player)
{
    CameraUtils.sendProfileToPlayer(name, player.getMCEntity(), true, true);
}

function ClearCash(name)
{
    var players = CNPSAPI.getIWorld(0).getAllPlayers();
    for (var i in players)
    {
        var camera = Camera.get(players[i].getMCEntity());
        camera.setCurrentProfile(name);
        camera.setCurrentProfileTimestamp(-1);
        CameraUtils.sendProfileToPlayer(name, players[i].getMCEntity(), false, false);
    }
}