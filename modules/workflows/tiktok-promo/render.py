"""
TikTok Promo workflow — TheSaaSsin Operator Panel

Renders a 720x1280 vertical (9:16) MP4, ~3s @ 30fps (90 frames),
locked v1.4 brand palette. Subject orbits, sigil pulses.

Driven from operator.js → POST /api/workflow/run → blender --background --python.

Env:
- OUTPUT_PATH — absolute path to the MP4 to write (required)
"""

import bpy
import math
import os
import sys

OUTPUT_PATH = os.environ.get("OUTPUT_PATH")
if not OUTPUT_PATH:
    print("ERROR: OUTPUT_PATH env var not set", file=sys.stderr)
    sys.exit(1)

bpy.ops.wm.read_factory_settings(use_empty=True)

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"


def srgb(r, g, b):
    return (r / 255.0, g / 255.0, b / 255.0, 1.0)


# --- World ---------------------------------------------------------------
world = bpy.data.worlds.new("PromoWorld")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs[0].default_value = (0.012, 0.012, 0.014, 1.0)
bg.inputs[1].default_value = 0.04

# --- Floor ---------------------------------------------------------------
bpy.ops.mesh.primitive_plane_add(size=24, location=(0, 0, 0))
floor = bpy.context.active_object
floor.name = "Floor"
fmat = bpy.data.materials.new("FloorMat")
fmat.use_nodes = True
fb = fmat.node_tree.nodes.get("Principled BSDF")
fb.inputs[0].default_value = srgb(58, 58, 68)
fb.inputs[2].default_value = 0.55
floor.data.materials.append(fmat)

# --- Architectural rear wall ---------------------------------------------
bpy.ops.mesh.primitive_plane_add(
    size=20, location=(0, -5, 4), rotation=(math.pi / 2, 0, 0)
)
wall = bpy.context.active_object
wall.name = "BackWall"
wmat = bpy.data.materials.new("WallMat")
wmat.use_nodes = True
wb = wmat.node_tree.nodes.get("Principled BSDF")
wb.inputs[0].default_value = srgb(107, 107, 128)
wb.inputs[2].default_value = 0.7
wall.data.materials.append(wmat)


# --- Hero subject: black-glass octahedron with red core ------------------
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.85, location=(0, -1.2, 1.6), segments=64, ring_count=32
)
shell = bpy.context.active_object
shell.name = "HeroShell"
smat = bpy.data.materials.new("ShellMat")
smat.use_nodes = True
sb = smat.node_tree.nodes.get("Principled BSDF")
sb.inputs[0].default_value = srgb(12, 12, 18)
sb.inputs[2].default_value = 0.12  # mirror finish
sb.inputs[12].default_value = 0.95  # specular
shell.data.materials.append(smat)
for p in shell.data.polygons:
    p.use_smooth = True

# Smaller red core inside (visible through reflections)
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.18, location=(0, -1.2, 1.6), segments=32, ring_count=16
)
core = bpy.context.active_object
core.name = "RedCore"
cmat = bpy.data.materials.new("CoreMat")
cmat.use_nodes = True
nodes = cmat.node_tree.nodes
links = cmat.node_tree.links
for n in list(nodes):
    nodes.remove(n)
out_n = nodes.new("ShaderNodeOutputMaterial")
em = nodes.new("ShaderNodeEmission")
em.inputs[0].default_value = srgb(255, 42, 42)
em.inputs[1].default_value = 3.0
links.new(em.outputs[0], out_n.inputs[0])
core.data.materials.append(cmat)
for p in core.data.polygons:
    p.use_smooth = True

# Floating ring
bpy.ops.mesh.primitive_torus_add(
    location=(0, -1.2, 1.6), major_radius=1.15, minor_radius=0.025
)
ring = bpy.context.active_object
ring.name = "Ring"
rmat = bpy.data.materials.new("RingMat")
rmat.use_nodes = True
rnodes = rmat.node_tree.nodes
rlinks = rmat.node_tree.links
for n in list(rnodes):
    rnodes.remove(n)
ro = rnodes.new("ShaderNodeOutputMaterial")
re_em = rnodes.new("ShaderNodeEmission")
re_em.inputs[0].default_value = srgb(240, 240, 245)
re_em.inputs[1].default_value = 1.5
rlinks.new(re_em.outputs[0], ro.inputs[0])
ring.data.materials.append(rmat)
for p in ring.data.polygons:
    p.use_smooth = True

# Animate ring spin and shell rotation
ring.rotation_euler = (0, 0, 0)
ring.keyframe_insert(data_path="rotation_euler", frame=1)
ring.rotation_euler = (math.radians(15), math.radians(360), math.radians(15))
ring.keyframe_insert(data_path="rotation_euler", frame=90)

shell.rotation_euler = (0, 0, 0)
shell.keyframe_insert(data_path="rotation_euler", frame=1)
shell.rotation_euler = (0, 0, math.radians(180))
shell.keyframe_insert(data_path="rotation_euler", frame=90)

# Pulse the core emission
em.inputs[1].default_value = 1.5
em.inputs[1].keyframe_insert("default_value", frame=1)
em.inputs[1].default_value = 5.5
em.inputs[1].keyframe_insert("default_value", frame=45)
em.inputs[1].default_value = 1.5
em.inputs[1].keyframe_insert("default_value", frame=90)

# --- Lighting -------------------------------------------------------------
bpy.ops.object.light_add(type="AREA", location=(-3.0, 3.0, 5.0))
key = bpy.context.active_object
key.data.size = 4.5
key.data.energy = 380
key.data.color = (1.0, 0.98, 0.96)
key.rotation_euler = (math.radians(58), 0, math.radians(40))

bpy.ops.object.light_add(type="AREA", location=(3.0, 3.0, 1.4))
fill = bpy.context.active_object
fill.data.size = 3.0
fill.data.energy = 80
fill.data.color = (0.85, 0.9, 1.0)
fill.rotation_euler = (math.radians(75), 0, math.radians(-20))

bpy.ops.object.light_add(type="AREA", location=(0, -3.5, 2.0))
rim = bpy.context.active_object
rim.data.size = 1.4
rim.data.energy = 50
rim.data.color = (1.0, 0.165, 0.165)
rim.rotation_euler = (math.radians(85), 0, 0)

# --- Camera with slow dolly ----------------------------------------------
bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, -1.2, 1.6))
target = bpy.context.active_object
target.name = "CamTarget"

cam_data = bpy.data.cameras.new("PromoCam")
cam_data.lens = 50
cam = bpy.data.objects.new("PromoCam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

track = cam.constraints.new("TRACK_TO")
track.target = target
track.track_axis = "TRACK_NEGATIVE_Z"
track.up_axis = "UP_Y"

cam.location = (1.8, 2.4, 2.0)
cam.keyframe_insert(data_path="location", frame=1)
cam.location = (-0.2, 1.6, 2.2)
cam.keyframe_insert(data_path="location", frame=90)

# --- Render settings: vertical 9:16, MP4 H264 -----------------------------
scene.render.resolution_x = 720
scene.render.resolution_y = 1280
scene.render.fps = 30
scene.frame_start = 1
scene.frame_end = 90

scene.render.image_settings.file_format = "FFMPEG"
scene.render.ffmpeg.format = "MPEG4"
scene.render.ffmpeg.codec = "H264"
scene.render.ffmpeg.constant_rate_factor = "MEDIUM"
scene.render.ffmpeg.audio_codec = "NONE"

scene.eevee.taa_render_samples = 16  # lower for animation, faster

# Filmic tone-mapping
scene.view_settings.view_transform = "Filmic"
scene.view_settings.look = "Medium Contrast"
scene.view_settings.exposure = -0.3

scene.render.filepath = OUTPUT_PATH
bpy.ops.render.render(animation=True)

print(f"DONE: {OUTPUT_PATH}")
