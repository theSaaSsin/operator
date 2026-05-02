"""
Path-C demo v1.4 — black non-emissive monitors, white architectural key+fill,
single arterial-red sigil on the operator. Apple-keynote photo-shoot lighting,
not Mr-Robot dungeon.

Brand palette v1.4 (locked):
- Ground / shadows:        #0a0a0f
- Architectural grey:      #6b6b80
- Mid-grey wall / floor:   #3a3a44
- Red accent (sigil only): #ff2a2a
- Light source:            white (5500K)
"""

import bpy
import math
import os
import sys

OUTPUT_DIR = os.environ.get("OUTPUT_DIR")
if not OUTPUT_DIR:
    print("ERROR: OUTPUT_DIR env var not set", file=sys.stderr)
    sys.exit(1)
os.makedirs(OUTPUT_DIR, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"

# --- World: deep ink black, very low ambient (let the lights do the work) -
world = bpy.data.worlds.new("OperatorWorld")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs[0].default_value = (0.012, 0.012, 0.014, 1.0)  # near pure black
bg.inputs[1].default_value = 0.04


def srgb(r, g, b):
    """Hex-style sRGB tuple to Blender's linear-ish input (good enough for Eevee)."""
    return (r / 255.0, g / 255.0, b / 255.0, 1.0)


# --- Floor (architectural concrete) ---------------------------------------
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0))
floor = bpy.context.active_object
floor.name = "ConcreteFloor"
fmat = bpy.data.materials.new("ConcreteMat")
fmat.use_nodes = True
fbsdf = fmat.node_tree.nodes.get("Principled BSDF")
fbsdf.inputs[0].default_value = srgb(58, 58, 68)  # #3a3a44 mid-grey
fbsdf.inputs[2].default_value = 0.55  # roughness — concrete reads matte
floor.data.materials.append(fmat)

# --- Back wall (architectural grey) ---------------------------------------
bpy.ops.mesh.primitive_plane_add(
    size=30, location=(0, -8, 4), rotation=(math.pi / 2, 0, 0)
)
backwall = bpy.context.active_object
backwall.name = "BackWall"
wmat = bpy.data.materials.new("WallMat")
wmat.use_nodes = True
wbsdf = wmat.node_tree.nodes.get("Principled BSDF")
wbsdf.inputs[0].default_value = srgb(107, 107, 128)  # #6b6b80 architectural grey
wbsdf.inputs[2].default_value = 0.7
backwall.data.materials.append(wmat)


# --- Monitor wall: 7-wide x 3-tall arc, MATTE BLACK, non-emissive ---------
def make_monitor(idx_x, idx_y, count_x):
    angle = (idx_x / (count_x - 1) - 0.5) * math.radians(110)
    radius = 4.0
    x = math.sin(angle) * radius
    y = -math.cos(angle) * radius
    z = idx_y * 0.85 + 1.2

    # Slight forward tilt (matches mounted display rake)
    bpy.ops.mesh.primitive_plane_add(
        size=0.95,
        location=(x, y, z),
        rotation=(math.pi / 2, 0, angle),
    )
    plane = bpy.context.active_object
    plane.name = f"Monitor_{idx_x}_{idx_y}"

    mat = bpy.data.materials.new(f"MonMat_{idx_x}_{idx_y}")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    # Matte-black mirror finish: dark but slightly reflective
    bsdf.inputs[0].default_value = srgb(10, 10, 15)  # #0a0a0f
    bsdf.inputs[2].default_value = 0.18  # low roughness — picks up reflections
    bsdf.inputs[12].default_value = 0.6  # specular IOR-ish
    plane.data.materials.append(mat)


for x in range(7):
    for y in range(3):
        make_monitor(x, y, 7)

# --- Operator silhouette (placeholder; FLUX hero plate replaces in v1) ----
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.32, depth=1.55, location=(0, -0.4, 0.78)
)
body = bpy.context.active_object
body.name = "OperatorBody"
bmat = bpy.data.materials.new("BodyMat")
bmat.use_nodes = True
bb = bmat.node_tree.nodes.get("Principled BSDF")
bb.inputs[0].default_value = srgb(15, 15, 18)
bb.inputs[2].default_value = 0.6
body.data.materials.append(bmat)

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(0, -0.4, 1.65))
head = bpy.context.active_object
head.name = "OperatorHead"
head.data.materials.append(bmat)

# --- THE single red accent: sigil emission patch on the operator's chest --
bpy.ops.mesh.primitive_plane_add(
    size=0.06, location=(0, -0.07, 1.28), rotation=(math.pi / 2, 0, 0)
)
sigil = bpy.context.active_object
sigil.name = "OperatorSigil"
smat = bpy.data.materials.new("SigilMat")
smat.use_nodes = True
nodes = smat.node_tree.nodes
links = smat.node_tree.links
for n in list(nodes):
    nodes.remove(n)
out = nodes.new("ShaderNodeOutputMaterial")
em = nodes.new("ShaderNodeEmission")
em.inputs[0].default_value = srgb(255, 42, 42)  # #ff2a2a
em.inputs[1].default_value = 18.0
links.new(em.outputs[0], out.inputs[0])
sigil.data.materials.append(smat)

# --- Lighting: large soft white key (camera-left high) --------------------
bpy.ops.object.light_add(type="AREA", location=(-3.5, 4.0, 5.0))
key = bpy.context.active_object
key.name = "KeyLight"
key.data.size = 5.0
key.data.energy = 380
key.data.color = (1.0, 0.98, 0.96)  # near-pure white, hint of warmth
key.rotation_euler = (math.radians(60), 0, math.radians(40))

# --- Cooler bounce fill (camera-right low) --------------------------------
bpy.ops.object.light_add(type="AREA", location=(3.0, 3.5, 1.6))
fill = bpy.context.active_object
fill.name = "FillLight"
fill.data.size = 3.0
fill.data.energy = 90
fill.data.color = (0.86, 0.90, 1.0)  # cool bounce
fill.rotation_euler = (math.radians(78), 0, math.radians(-25))

# --- Architectural strip from above (cool, defines back wall) -------------
bpy.ops.object.light_add(type="AREA", location=(0, -6.5, 6.5))
top = bpy.context.active_object
top.name = "TopArchitectural"
top.data.shape = "RECTANGLE"
top.data.size = 8.0
top.data.size_y = 0.4
top.data.energy = 140
top.data.color = (0.94, 0.96, 1.0)
top.rotation_euler = (math.radians(20), 0, 0)

# --- Camera target empty + dolly camera with Track To ---------------------
bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, -0.4, 1.4))
target = bpy.context.active_object
target.name = "CamTarget"

cam_data = bpy.data.cameras.new("OperatorCam")
cam_data.lens = 35
cam = bpy.data.objects.new("OperatorCam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

track = cam.constraints.new("TRACK_TO")
track.target = target
track.track_axis = "TRACK_NEGATIVE_Z"
track.up_axis = "UP_Y"

cam.location = (1.2, 6.5, 1.7)
cam.keyframe_insert(data_path="location", frame=1)

cam.location = (0.6, 4.4, 1.6)
cam.keyframe_insert(data_path="location", frame=120)

scene.frame_start = 1
scene.frame_end = 120

# --- Render settings ------------------------------------------------------
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.image_settings.file_format = "PNG"
scene.render.film_transparent = False

# Eevee: bump samples (bloom in 5.1 lives in the compositor — skipping for v1)
scene.eevee.taa_render_samples = 64

# --- Render midpoint thumbnail --------------------------------------------
scene.frame_set(60)
out_path = os.path.join(OUTPUT_DIR, "F02_dolly_midpoint_v002.png")
scene.render.filepath = out_path
bpy.ops.render.render(write_still=True)

print(f"DONE: {out_path}")
