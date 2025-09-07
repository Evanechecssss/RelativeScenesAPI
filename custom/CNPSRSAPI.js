/**
 * Dependencies: RelativeScenesAPI.js
 *
 */
function init(e)
{
    //It can be e.npc etc.
    var player = e.player;
    var world = player.world.getMCWorld();

    var scene_name = "test";
    var scene_name2 = "test2";
    var degrees = 90;

    runThread(function () {
        DuplicateScene(scene_name, scene_name2, world);
        RotateScene(scene_name2,scene_name2,world,degrees);
        PlayScene(scene_name2, world, 0);
        java.lang.Thread.sleep(100);
        DeleteScene(scene_name2, world);
    })
}
