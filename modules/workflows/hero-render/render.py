"""
3D Hero Render workflow — TheSaaSsin Operator Panel

Renders a single 1280x720 PNG of a shiny architectural hero on the locked
v1.4 brand palette (black + grey + red, white architectural light).

Driven from operator.js → POST /api/workflow/run → blender --background --python.

Env:
- OUTPUT_PATH — absolute path to the PNG to write (required)
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


# --- World: deep ink black ----------------------------------------------
world = bpy.data.worlds.new("HeroWorld")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs[0].default_value = (0.012, 0.012, 0.014, 1.0)
bg.inputs[1].default_value = 0.04

# --- Concrete floor ------------------------------------------------------
bpy.ops.mesh.primitive_plane_add(size=24, location=(0, 0, 0))
floor = bpy.context.active_object
floor.name = "Floor"
fmat = bpy.data.materials.new("FloorMat")
fmat.use_nodes = True
fb = fmat.node_tree.nodes.get("Principled BSDF")
fb.inputs[0].default_value = srgb(58, 58, 68)  # mid-grey
fb.inputs[2].default_value = 0.6
floor.data.materials.append(fmat)

# --- Architectural back wall --------------------------------------------
bpy.ops.mesh.primitive_plane_add(
    size=24, location=(0, -6, 4), rotation=(math.pi / 2, 0, 0)
)
wall = bpy.context.active_object
wall.name = "BackWall"
wmat = bpy.data.materials.new("WallMat")
wmat.use_nodes = True
wb = wmat.node_tree.nodes.get("Principled BSDF")
wb.inputs[0].default_value = srgb(107, 107, 128)  # architectural grey
wb.inputs[2].default_value = 0.7
wall.data.materials.append(wmat)


# --- THE HERO — black-glass torus + glowing red core sphere -------------
# Torus = "operator wheel" feel
bpy.ops.mesh.primitive_torus_add(
    location=(0, -1.2, 1.6),
    major_radius=0.95,
    minor_radius=0.18,
    rotation=(math.radians(70), 0, math.radians(20)),
)
torus = bpy.context.active_object
torus.name = "HeroTorus"
tmat = bpy.data.materials.new("HeroTorusMat")
tmat.use_nodes = True
tb = tmat.node_tree.nodes.get("Principled BSDF")
tb.inputs[0].default_value = srgb(15, 15, 20)  # black glass
tb.inputs[2].default_value = 0.08  # very low roughness — mirror finish
tb.inputs[12].default_value = 0.95  # specular
torus.data.materials.append(tmat)
# Smooth shading
for p in torus.data.polygons:
    p.use_smooth = True

# Red core sphere — emissive
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.36, location=(0, -1.2, 1.6), segments=64, ring_count=32
)
core = bpy.context.active_object
core.name = "HeroCore"
cmat = bpy.data.materials.new("HeroCoreMat")
cmat.use_nodes = True
nodes = cmat.node_tree.nodes
links = cmat.node_tree.links
for n in list(nodes):
    nodes.remove(n)
out_node = nodes.new("ShaderNodeOutputMaterial")
em = nodes.new("ShaderNodeEmission")
em.inputs[0].default_value = srgb(255, 42, 42)  # arterial red
em.inputs[1].default_value = 8.0
links.new(em.outputs[0], out_node.inputs[0])
core.data.materials.append(cmat)
for p in core.data.polygons:
    p.use_smooth = True

# Floating ring around the core — subtle accent
bpy.ops.mesh.primitive_torus_add(
    location=(0, -1.2, 1.6),
    major_radius=0.55,
    minor_radius=0.025,
    rotation=(0, 0, 0),
)
ring = bpy.context.active_object
ring.name = "HeroRing"
rmat = bpy.data.materials.new("HeroRingMat")
rmat.use_nodes = True
rnodes = rmat.node_tree.nodes
rlinks = rmat.node_tree.links
for n in list(rnodes):
    rnodes.remove(n)
ro = rnodes.new("ShaderNodeOutputMaterial")
re = rnodes.new("ShaderNodeEmission")
re.inputs[0].default_value = srgb(240, 240, 245)  # near-white
re.inputs[1].default_value = 2.0
rlinks.new(re.outputs[0], ro.inputs[0])
ring.data.materials.append(rmat)
for p in ring.data.polygons:
    p.use_smooth = True

# Pedestal — black glass cylinder under the hero
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.55, depth=1.0, location=(0, -1.2, 0.5), vertices=64
)
ped = bpy.context.active_object
ped.name = "Pedestal"
pmat = bpy.data.materials.new("PedestalMat")
pmat.use_nodes = True
pb = pmat.node_tree.nodes.get("Principled BSDF")
pb.inputs[0].default_value = srgb(10, 10, 15)
pb.inputs[2].default_value = 0.15
pb.inputs[12].default_value = 0.85
ped.data.materials.append(pmat)
for p in ped.data.polygons:
    p.use_smooth = True

# --- Lighting: studio-arch white key + cool fill + accent rim -----------
bpy.ops.object.light_add(type="AREA", location=(-3.5, 3.5, 5.2))
key = bpy.context.active_object
key.name = "Key"
key.data.size = 4.5
key.data.energy = 420
key.data.color = (1.0, 0.98, 0.96)
key.rotation_euler = (math.radians(58), 0, math.radians(40))

bpy.ops.object.light_add(type="AREA", location=(3.0, 3.0, 1.4))
fill = bpy.context.active_object
fill.name = "Fill"
fill.data.size = 3.0
fill.data.energy = 80
fill.data.color = (0.85, 0.9, 1.0)
fill.rotation_euler = (math.radians(75), 0, math.radians(-20))

# Red rim from behind, picks the back of the torus
bpy.ops.object.light_add(type="AREA", location=(0, -3.5, 2.0))
rim = bpy.context.active_object
rim.name = "RedRim"
rim.data.size = 1.6
rim.data.energy = 65
rim.data.color = (1.0, 0.165, 0.165)
rim.rotation_euler = (math.radians(85), 0, 0)

# --- Camera --------------------------------------------------------------
bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, -1.2, 1.6))
target = bpy.context.active_object
target.name = "CamTarget"

cam_data = bpy.data.cameras.new("HeroCam")
cam_data.lens = 50
cam = bpy.data.objects.new("HeroCam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

track = cam.constraints.new("TRACK_TO")
track.target = target
track.track_axis = "TRACK_NEGATIVE_Z"
track.up_axis = "UP_Y"

cam.location = (1.6, 2.6, 2.0)

# --- Render --------------------------------------------------------------
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.image_settings.file_format = "PNG"
scene.render.film_transparent = False
scene.eevee.taa_render_samples = 64

scene.render.filepath = OUTPUT_PATH
bpy.ops.render.render(write_still=True)

print(f"DONE: {OUTPUT_PATH}")
