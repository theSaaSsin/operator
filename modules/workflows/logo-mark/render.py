"""
Logo Mark workflow — TheSaaSsin Operator Panel

Renders a clean 1080x1080 PNG of the operator sigil — black-glass plinth
with a glowing red kanji-style mark stamped on the front face. Hero
beauty-shot framing, white architectural lighting, brand v1.4 palette.

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

# --- World ---------------------------------------------------------------
world = bpy.data.worlds.new("LogoWorld")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.012, 0.012, 0.014, 1.0)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.04

# --- Floor (architectural concrete) -------------------------------------
bpy.ops.mesh.primitive_plane_add(size=24, location=(0, 0, 0))
floor = bpy.context.active_object
fmat = bpy.data.materials.new("FloorMat")
fmat.use_nodes = True
fb = fmat.node_tree.nodes.get("Principled BSDF")
fb.inputs[0].default_value = srgb(58, 58, 68)  # mid-grey
fb.inputs[2].default_value = 0.55
floor.data.materials.append(fmat)

# --- Back wall ----------------------------------------------------------
bpy.ops.mesh.primitive_plane_add(
    size=18, location=(0, -5, 4), rotation=(math.pi / 2, 0, 0)
)
wall = bpy.context.active_object
wmat = bpy.data.materials.new("WallMat")
wmat.use_nodes = True
wb = wmat.node_tree.nodes.get("Principled BSDF")
wb.inputs[0].default_value = srgb(107, 107, 128)  # architectural grey
wb.inputs[2].default_value = 0.7
wall.data.materials.append(wmat)

# --- Plinth (black glass, taller than wide for hero feel) ---------------
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 1.4))
plinth = bpy.context.active_object
plinth.name = "Plinth"
plinth.scale = (1.0, 1.0, 2.4)  # tall slab
pmat = bpy.data.materials.new("PlinthMat")
pmat.use_nodes = True
pb = pmat.node_tree.nodes.get("Principled BSDF")
pb.inputs[0].default_value = srgb(10, 10, 15)
pb.inputs[2].default_value = 0.08  # mirror finish
pb.inputs[12].default_value = 0.95  # high specular
plinth.data.materials.append(pmat)
# Slight tilt to catch reflection off front face
plinth.rotation_euler = (0, 0, math.radians(-12))

# --- Sigil (red emissive plane stamped on front face) -------------------
# Plinth rotated -12°, so front face is now angled. Place sigil parented to plinth.
bpy.ops.mesh.primitive_plane_add(
    size=0.62,
    location=(0, -0.51, 1.6),
    rotation=(math.pi / 2, 0, 0),
)
sigil = bpy.context.active_object
sigil.name = "Sigil"
smat = bpy.data.materials.new("SigilMat")
smat.use_nodes = True
nodes = smat.node_tree.nodes
links = smat.node_tree.links
for n in list(nodes):
    nodes.remove(n)
out = nodes.new("ShaderNodeOutputMaterial")
em = nodes.new("ShaderNodeEmission")
em.inputs[0].default_value = srgb(255, 42, 42)
em.inputs[1].default_value = 2.2  # tame so Filmic doesn't crush it pink
links.new(em.outputs[0], out.inputs[0])
sigil.data.materials.append(smat)
# Parent sigil to plinth so the -12° rotation carries
sigil.parent = plinth
sigil.matrix_parent_inverse = plinth.matrix_world.inverted()

# --- Lighting: white architectural key + cool fill + tiny red rim -------
bpy.ops.object.light_add(type="AREA", location=(-3.5, 3.5, 5.2))
key = bpy.context.active_object
key.data.size = 4.5
key.data.energy = 420
key.data.color = (1.0, 0.98, 0.96)
key.rotation_euler = (math.radians(58), 0, math.radians(40))

bpy.ops.object.light_add(type="AREA", location=(3.0, 3.0, 1.6))
fill = bpy.context.active_object
fill.data.size = 3.0
fill.data.energy = 90
fill.data.color = (0.85, 0.9, 1.0)
fill.rotation_euler = (math.radians(75), 0, math.radians(-25))

bpy.ops.object.light_add(type="AREA", location=(0, -3.5, 2.6))
rim = bpy.context.active_object
rim.data.size = 1.0
rim.data.energy = 18
rim.data.color = (1.0, 0.165, 0.165)
rim.rotation_euler = (math.radians(85), 0, 0)

# --- Camera (hero 3/4 shot) ---------------------------------------------
bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 1.5))
target = bpy.context.active_object

cam_data = bpy.data.cameras.new("LogoCam")
cam_data.lens = 65
cam = bpy.data.objects.new("LogoCam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

track = cam.constraints.new("TRACK_TO")
track.target = target
track.track_axis = "TRACK_NEGATIVE_Z"
track.up_axis = "UP_Y"

cam.location = (1.6, -4.2, 1.9)

# --- Render: 1:1 1080x1080 PNG ------------------------------------------
scene.render.resolution_x = 1080
scene.render.resolution_y = 1080
scene.render.image_settings.file_format = "PNG"
scene.eevee.taa_render_samples = 64
scene.view_settings.view_transform = "Filmic"
scene.view_settings.look = "Medium Contrast"
scene.view_settings.exposure = -0.25

scene.render.filepath = OUTPUT_PATH
bpy.ops.render.render(write_still=True)
print(f"DONE: {OUTPUT_PATH}")
