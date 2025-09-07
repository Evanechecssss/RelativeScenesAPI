/**
 * Dependencies: RelativeCameraAPI.js
 *
 */
function init(e)
{
    var player = e.player;
    var origin = "test"
    var copy = "test2"

    ChangeCamera(origin, copy, CameraCopy, null);
    ChangeCamera(copy, copy, CameraRotate, {yaw: 90, pitch: 0});

    var position = new Vector3f(player.x, player.y, player.z);
    ChangeCamera(copy, copy, CameraMove, position);

    RunCamera(copy, player.getMCEntity());


    ClearCash(copy);
}


function ClearCash(name)
{
    var players = Java.type("noppes.npcs.api.NpcAPI").Instance().getIWorld(0).getAllPlayers();

    for (var i in players)
    {
        var camera = Camera.get(players[i].getMCEntity());
        camera.setCurrentProfile(name);
        camera.setCurrentProfileTimestamp(-1);
        CameraUtils.sendProfileToPlayer(name, players[i].getMCEntity(), false, false);
    }
}
