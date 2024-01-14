// Unpublished
// var AbstractMorphUtil = Java.type("kiraririria.serverscenes.util.AbstractMorphUtil")

function VisitScene(scene_name, save_name, world, names) {
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
            record.filename = replayDestination.id + ((counter != 0) ? "_" + Integer.toString(counter) : "");
            replayDestination.id = record.filename;
            AbstractMorphUtil.setRenderFor(JString.join(";", names), replayDestination.morph)
            record.save(RecordUtils.replayFile(record.filename));
            CommonProxy.manager.records.put(record.filename, record);
        }
        catch (e)
        {
            e.printStackTrace();
        }
    }
    BBCommonProxy.scenes.save(save_name, scene);
    //BBClientProxy.manager.reset();
}