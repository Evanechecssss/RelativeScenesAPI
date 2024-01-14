/**
 * <RELATIVE SCENES API>
 * <VERSION: 0.4>
 * <Git: https://github.com/Evanechecssss/RelativeScenesAPI>
 *
 * Author: ⚘'Ivan'⚘ (Evanechecssss)
 * License: GNU General Public License v3
 * Thanks:
 * - McHorse for his mods
 * - Creman for help with trigonometry
 * - Oshi for everything
 */

var Integer = Java.type("java.lang.Integer");
var JString = Java.type("java.lang.String")
var Math = Java.type("java.lang.Math");
var AffineTransform = Java.type("java.awt.geom.AffineTransform");
var Vector3f = Java.type("javax.vecmath.Vector3f");
var Vector2f = Java.type("javax.vecmath.Vector2f")
var Matrix3f = Java.type("javax.vecmath.Matrix3f");
var CommandRecord = Java.type("mchorse.blockbuster.commands.CommandRecord");
var RecordUtils = Java.type("mchorse.blockbuster.recording.RecordUtils");
var BBCommonProxy = Java.type("mchorse.blockbuster.CommonProxy");
var BBClientProxy = Java.type("mchorse.blockbuster.ClientProxy");
var Scene = Java.type("mchorse.blockbuster.recording.scene.Scene");
var Replay = Java.type("mchorse.blockbuster.recording.scene.Replay");
var Camera = Java.type("mchorse.aperture.capabilities.camera.Camera");
var CameraUtils = Java.type("mchorse.aperture.camera.CameraUtils");
var CNPSAPI = Java.type("noppes.npcs.api.NpcAPI").Instance();
