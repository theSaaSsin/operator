"""
Logo Mark workflow — TheSaaSsin Operator Panel

Renders a 1080x1080 square 3s MP4 of the operator sigil — a black-glass
plinth with a glowing red kanji-style mark stamped on the front face,
slow turntable rotation. Brand v1.4 palette.

Driven from operator.js → POST /api/workflow/run.
Env: OUTPUT_PATH (required)
"""
import bpy, math, os, sys

OUTPUT_PATH = os.environ.get("OUTPUT_PATH")
if not OUTPUT_PATH:
    print("ERROR: OUTPUT_PATH env var not set", file=sys.stderr); sys.exit(1)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"

def srgb(r, g, b): return (r/255.0, g/255.0, b/255.0, 1.0)

# World
world = bpy.data.worlds.new("LogoWorld")
scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.012, 0.012, 0.014, 1.0)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.04

# Floor + back wall
bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, 0))
floor = bpy.context.active_object
fmat = bpy.data.materials.new("F"); fmat.use_nodes = True
fb = fmat.node_tree.nodes.get("Principled BSDF")
fb.inputs[0].default_value = srgb(58, 58, 68); fb.inputs[2].default_value = 0.55
floor.data.materials.append(fmat)

# Plinth (the mark sits on it)
bpy.ops.mesh.primitive_cube_add(size=2.0, location=(0, 0, 1.0))
plinth = bpy.context.active_object
pl = bpy.data.materials.new("P"); pl.use_nodes = True
pb = pl.node_tree.nodes.get("Principled BSDF")
pb.inputs[0].default_value = srgb(12, 12, 18); pb.inputs[2].default_value = 0.12; pb.inputs[12].default_value = 0.95
plinth.data.materials.append(pl)
for p in plinth.data.polygons: p.use_smooth = False

# Red sigil — flat plane stamped on front face of plinth, emissive
bpy.ops.mesh.primitive_plane_add(size=1.4, location=(0, -1.005, 1.0), rotation=(math.pi/2, 0, 0))
sigil = bpy.context.active_object
smat = bpy.data.materials.new("S"); smat.use_nodes = True
nodes = smat.node_tree.nodes; links = smat.node_tree.links
for n in list(nodes): nodes.remove(n)
out = nodes.new("ShaderNodeOutputMaterial")
em = nodes.new("ShaderNodeEmission")
em.inputs[0].default_value = srgb(255, 42, 42)
em.inputs[1].default_value = 2.5
links.new(em.outputs[0], out.inputs[0])
sigil.data.materials.append(smat)

# Animate slow turntable
plinth.rotation_euler = (0, 0, 0); plinth.keyframe_insert("rotation_euler", frame=1)
plinth.rotation_euler = (0, 0, math.radians(360)); plinth.keyframe_insert("rotation_euler", frame=90)
sigil.rotation_euler = (math.pi/2, 0, 0); sigil.keyframe_insert("rotation_euler", frame=1)
# Keep sigil glued to plinth front
sigil.parent = plinth

# Pulse sigil
em.inputs[1].default_value = 1.5; em.inputs[1].keyframe_insert("default_value", frame=1)
em.inputs[1].default_value = 4.5; em.inputs[1].keyframe_insert("default_value", frame=45)
em.inputs[1].default_value = 1.5; em.inputs[1].keyframe_insert("default_value", frame=90)

# Lighting
bpy.ops.object.light_add(type="AREA", location=(-3.0, 3.0, 4.5))
k = bpy.context.active_object; k.data.size = 4.0; k.data.energy = 380
k.data.color = (1.0, 0.98, 0.96); k.rotation_euler = (math.radians(58), 0, math.radians(40))
bpy.ops.object.light_add(type="AREA", location=(3.0, 3.0, 1.4))
fl = bpy.context.active_object; fl.data.size = 2.5; fl.data.energy = 70
fl.data.color = (0.85, 0.9, 1.0); fl.rotation_euler = (math.radians(75), 0, math.radians(-20))

# Camera
bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 1.0))
target = bpy.context.active_object
cam_data = bpy.data.cameras.new("C"); cam_data.lens = 50
cam = bpy.data.objects.new("C", cam_data); scene.collection.objects.link(cam); scene.camera = cam
tr = cam.constraints.new("TRACK_TO"); tr.target = target; tr.track_axis = "TRACK_NEGATIVE_Z"; tr.up_axis = "UP_Y"
cam.location = (0, -4.5, 1.6)

# Render: 1080x1080 square, MP4, 30fps, 3s
scene.render.resolution_x = 1080; scene.render.resolution_y = 1080
scene.render.fps = 30; scene.frame_start = 1; scene.frame_end = 90
scene.render.image_settings.file_format = "FFMPEG"
scene.render.ffmpeg.format = "MPEG4"; scene.render.ffmpeg.codec = "H264"
scene.render.ffmpeg.constant_rate_factor = "MEDIUM"; scene.render.ffmpeg.audio_codec = "NONE"
scene.eevee.taa_render_samples = 16
scene.view_settings.view_transform = "Filmic"
scene.view_settings.look = "Medium Contrast"; scene.view_settings.exposure = -0.3
scene.render.filepath = OUTPUT_PATH
bpy.ops.render.render(animation=True)
print(f"DONE: {OUTPUT_PATH}")
