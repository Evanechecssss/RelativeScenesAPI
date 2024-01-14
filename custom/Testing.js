function AffineTest(event, theta, dx, dy, dz, sx, sy, sz)
{
    var player = e.player;
    var world = player.world.getMCWorld();
    var scene_name = "scene"
    var scene_name2 = "scene_copy"

    var rotateX = new AffineTransform();
    rotateX.rotate(Math.toRadians(theta), 1, 0);// Вращение на угол theta вокруг оси x
    AffineScene(scene_name, scene_name2, world, rotateX, theta)

    var rotateY = new AffineTransform();
    rotateY.rotate(Math.toRadians(theta), 0, 1);// Вращение на угол theta вокруг оси y
    AffineScene(scene_name, scene_name2, world, rotateY, theta)

    var rotateZ = new AffineTransform();
    rotateZ.rotate(Math.toRadians(theta), 0, 0);// Вращение на угол theta вокруг оси z
    AffineScene(scene_name, scene_name2, world, rotateZ, theta)


    var translate = new AffineTransform();
    translate.translate(dx, dy, dz);// Сдвиг по осям x, y, z
    AffineScene(scene_name, scene_name2, world, translate)


    var scale = new AffineTransform();
    scale.scale(sx, sy, sz);// Сужение и расширение по осям x, y, z
    AffineScene(scene_name, scene_name2, world, translate)
}

function MainTest(e) {
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

//AbsoluteScenesAPI Testing
function chat(e)
{
    if (e.message.indexOf("atan") !== -1)
    {
        var player = e.player;
        var world = player.world.getMCWorld();
        var player_position = new Vector3f(player.x, player.y, player.z);
        var player_yaw = player.getMCEntity().rotationYaw + 90;
        var text = e.message
        var args = text.split(" ")
        var name = "test"+args[1]
        var name2 = "test"+args[1]+"2"
        ChangeScene(name, name2, world, AtanizeScene, {side:args[2]==null?1:-1})
        PlayScene(name2, world, 0);
    }
    if (e.message.indexOf("copy") !== -1)
    {
        var player = e.player;
        var world = player.world.getMCWorld();
        var player_position = new Vector3f(player.x, player.y, player.z);
        var player_yaw = player.getMCEntity().rotationYaw + 90;
        var text = e.message
        var args = text.split(" ")
        var name = "test"+args[1]
        var name2 = "test"+args[1]+"2"
        DuplicateScene(name, name2, world);
    }
    if (e.message.indexOf("play") !== -1)
    {
        var player = e.player;
        var world = player.world.getMCWorld();
        var player_position = new Vector3f(player.x, player.y, player.z);
        var player_yaw = player.getMCEntity().rotationYaw + 90;
        var text = e.message
        var args = text.split(" ")
        var name = "test"+args[1]
        var name2 = "test"+args[1]+"2"
        PlayScene(name, world, 0);
    }
}

//RelativeRenderAPI Testing (Unpublished)
function exampleFunction(e)
{
    var player = e.player;
    var world = player.world.getMCWorld();
    var player_position = new Vector3f(player.x, player.y, player.z);
    var player_yaw = player.getMCEntity().rotationYaw + 90;
    var scene_name = "scene_name"
    var scene_name2 = "scene_name2"
    VisitScene(scene_name, scene_name2, world, [player.name])
    ChangeScene(scene_name, scene_name2, world, MoveScene, {position: player_position, yaw: player_yaw})
    PlayScene(scene_name2, world, 0);
}