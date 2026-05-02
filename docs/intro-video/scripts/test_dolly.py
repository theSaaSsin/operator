"""
Path-C demo — proves Blender can be driven headlessly with brand palette.

Builds a throwaway scene matching shot F02 (operator command room, est. wide,
slow dolly in) at low fidelity, renders one PNG at the dolly midpoint.

Brand palette (locked, from public/operator.css):
- Ground:  #0a0a0f
- Accent:  #ff2a2a  (every emissive surface uses this OR near-white)
- Text:    #f0f0f5
"""

import bpy
import math
import os
import sys

# --- Args from --python-expr wrapper --------------------------------------
OUTPUT_DIR = os.environ.get("OUTPUT_DIR")
if not OUTPUT_DIR:
    print("ERROR: OUTPUT_DIR env var not set", file=sys.stderr)
    sys.exit(1)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# --- Wipe scene, fresh start ----------------------------------------------
bpy.ops.wm.read_factory_settings(use_empty=True)

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"

# --- World: deep ink black (#0a0a0f) --------------------------------------
world = bpy.data.worlds.new("OperatorWorld")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs[0].default_value = (0.039, 0.039, 0.06, 1.0)  # #0a0a0f
bg.inputs[1].default_value = 0.05  # near-black ambient

# --- Ground (concrete-feel) -----------------------------------------------
bpy.ops.mesh.primitive_plane_add(size=24, location=(0, 0, 0))
ground = bpy.context.active_object
ground.name = "Ground"
gmat = bpy.data.materials.new("GroundMat")
gmat.use_nodes = True
gbsdf = gmat.node_tree.nodes.get("Principled BSDF")
gbsdf.inputs[0].default_value = (0.06, 0.06, 0.075, 1.0)  # near deep ink
gbsdf.inputs[2].default_value = 0.4  # roughness
ground.data.materials.append(gmat)


# --- Monitor wall: 7-wide x 3-tall arc, planes facing centre --------------
def make_monitor(idx_x, idx_y, count_x):
    angle = (idx_x / (count_x - 1) - 0.5) * math.radians(110)  # 110-degree arc
    radius = 4.0
    x = math.sin(angle) * radius
    y = -math.cos(angle) * radius
    z = idx_y * 0.85 + 1.2

    bpy.ops.mesh.primitive_plane_add(
        size=0.95,
        location=(x, y, z),
        rotation=(math.pi / 2, 0, angle),
    )
    plane = bpy.context.active_object
    plane.name = f"Monitor_{idx_x}_{idx_y}"

    mat = bpy.data.materials.new(f"MonMat_{idx_x}_{idx_y}")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    for n in list(nodes):
        nodes.remove(n)
    out = nodes.new("ShaderNodeOutputMaterial")
    em = nodes.new("ShaderNodeEmission")

    # Brand palette only — most monitors near-white (UI), every 4th red
    if (idx_x + idx_y * 3) % 4 == 0:
        em.inputs[0].default_value = (1.0, 0.165, 0.165, 1.0)  # #ff2a2a
        em.inputs[1].default_value = 5.0
    else:
        em.inputs[0].default_value = (0.94, 0.94, 0.96, 1.0)  # text white
        em.inputs[1].default_value = 1.4
    links.new(em.outputs[0], out.inputs[0])
    plane.data.materials.append(mat)


for x in range(7):
    for y in range(3):
        make_monitor(x, y, 7)

# --- Operator silhouette (placeholder geometry — FLUX hero plate replaces in v1) -
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.32, depth=1.55, location=(0, -0.4, 0.78)
)
body = bpy.context.active_object
body.name = "OperatorBody"
bmat = bpy.data.materials.new("BodyMat")
bmat.use_nodes = True
bb = bmat.node_tree.nodes.get("Principled BSDF")
bb.inputs[0].default_value = (0.018, 0.018, 0.022, 1.0)  # near-pure black
bb.inputs[2].default_value = 0.6
body.data.materials.append(bmat)

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(0, -0.4, 1.65))
head = bpy.context.active_object
head.name = "OperatorHead"
head.data.materials.append(bmat)

# Subtle red rim light on the operator (single accent only)
bpy.ops.object.light_add(type="AREA", location=(1.6, -1.0, 1.4))
rim = bpy.context.active_object
rim.name = "RimRedKey"
rim.data.size = 1.2
rim.data.energy = 28
rim.data.color = (1.0, 0.165, 0.165)  # #ff2a2a
rim.rotation_euler = (math.radians(70), math.radians(20), 0)

# --- Camera target empty (Track To anchor) --------------------------------
bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, -0.4, 1.5))
target = bpy.context.active_object
target.name = "CamTarget"

# --- Camera with dolly-in animation (F02 move) + Track To ------------------
cam_data = bpy.data.cameras.new("OperatorCam")
cam_data.lens = 35
cam = bpy.data.objects.new("OperatorCam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

track = cam.constraints.new("TRACK_TO")
track.target = target
track.track_axis = "TRACK_NEGATIVE_Z"
track.up_axis = "UP_Y"

cam.location = (0, 6.5, 1.6)
cam.keyframe_insert(data_path="location", frame=1)

cam.location = (0, 4.4, 1.6)
cam.keyframe_insert(data_path="location", frame=120)

# Fill light from camera side, low intensity, neutral
bpy.ops.object.light_add(type="AREA", location=(-2.0, 5.0, 2.5))
fill = bpy.context.active_object
fill.name = "FillKey"
fill.data.size = 3.0
fill.data.energy = 12
fill.data.color = (0.85, 0.85, 0.95)
fill.rotation_euler = (math.radians(75), 0, math.radians(20))

scene.frame_start = 1
scene.frame_end = 120

# --- Render settings ------------------------------------------------------
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.image_settings.file_format = "PNG"
scene.render.film_transparent = False

# --- Render midpoint thumbnail --------------------------------------------
scene.frame_set(60)
out_path = os.path.join(OUTPUT_DIR, "F02_dolly_midpoint_v001.png")
scene.render.filepath = out_path
bpy.ops.render.render(write_still=True)

print(f"DONE: {out_path}")
