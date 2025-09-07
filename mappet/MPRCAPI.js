/**
 * Dependencies: RelativeCameraAPI.js
 *
 */
function main(c)
{
    var subject = c.getSubject();
    var origin = "test"
    var copy = "test2"

    ChangeCamera(origin, copy, CameraCopy, null);
    ChangeCamera(copy, copy, CameraRotate, {yaw: 90, pitch: 0});

    var position = new Vector3f(player.x, player.y, player.z);
    ChangeCamera(copy, copy, CameraMove, position);

    RunCamera(copy, player.getMinecraftEntity());

    ClearCash(copy, c);
}


function ClearCash(name, context)
{
    var players = context.getServer().getAllPlayers();
    for (var i in players)
    {
        var camera = Camera.get(players[i].getMinecraftEntity());
        camera.setCurrentProfile(name);
        camera.setCurrentProfileTimestamp(-1);
        CameraUtils.sendProfileToPlayer(name, players[i].getMinecraftEntity(), false, false);
    }
}
