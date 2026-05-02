"""
Square Card workflow — single 1080x1080 PNG of the brand hero, ready to drop
into IG feed, LinkedIn, or X. Brand v1.4 palette.
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
world = bpy.data.worlds.new("CardWorld"); scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.012, 0.012, 0.014, 1.0)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.04

# Floor
bpy.ops.mesh.primitive_plane_add(size=20)
fmat = bpy.data.materials.new("F"); fmat.use_nodes = True
fmat.node_tree.nodes.get("Principled BSDF").inputs[0].default_value = srgb(58, 58, 68)
fmat.node_tree.nodes.get("Principled BSDF").inputs[2].default_value = 0.55
bpy.context.active_object.data.materials.append(fmat)

# Hero: black-glass shell + small red core
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.85, location=(0, -1.0, 1.6), segments=64, ring_count=32)
shell = bpy.context.active_object
sm = bpy.data.materials.new("Sh"); sm.use_nodes = True
sb = sm.node_tree.nodes.get("Principled BSDF")
sb.inputs[0].default_value = srgb(12, 12, 18); sb.inputs[2].default_value = 0.1; sb.inputs[12].default_value = 0.95
shell.data.materials.append(sm)
for p in shell.data.polygons: p.use_smooth = True

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.14, location=(0, -1.0, 1.6))
core = bpy.context.active_object
cm = bpy.data.materials.new("Co"); cm.use_nodes = True
nodes = cm.node_tree.nodes; links = cm.node_tree.links
for n in list(nodes): nodes.remove(n)
out = nodes.new("ShaderNodeOutputMaterial"); em = nodes.new("ShaderNodeEmission")
em.inputs[0].default_value = srgb(255, 42, 42); em.inputs[1].default_value = 2.5
links.new(em.outputs[0], out.inputs[0])
core.data.materials.append(cm)
for p in core.data.polygons: p.use_smooth = True

# Lighting
bpy.ops.object.light_add(type="AREA", location=(-3.0, 3.0, 5.0))
k = bpy.context.active_object; k.data.size = 4.5; k.data.energy = 400
k.data.color = (1.0, 0.98, 0.96); k.rotation_euler = (math.radians(58), 0, math.radians(40))
bpy.ops.object.light_add(type="AREA", location=(3.0, 3.0, 1.4))
fl = bpy.context.active_object; fl.data.size = 3.0; fl.data.energy = 80
fl.data.color = (0.85, 0.9, 1.0); fl.rotation_euler = (math.radians(75), 0, math.radians(-20))

# Camera
bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, -1.0, 1.6))
target = bpy.context.active_object
cam_data = bpy.data.cameras.new("C"); cam_data.lens = 60
cam = bpy.data.objects.new("C", cam_data); scene.collection.objects.link(cam); scene.camera = cam
tr = cam.constraints.new("TRACK_TO"); tr.target = target; tr.track_axis = "TRACK_NEGATIVE_Z"; tr.up_axis = "UP_Y"
cam.location = (1.4, 2.4, 2.0)

# Render: 1080x1080 PNG
scene.render.resolution_x = 1080; scene.render.resolution_y = 1080
scene.render.image_settings.file_format = "PNG"
scene.eevee.taa_render_samples = 64
scene.view_settings.view_transform = "Filmic"
scene.view_settings.look = "Medium Contrast"; scene.view_settings.exposure = -0.3
scene.render.filepath = OUTPUT_PATH
bpy.ops.render.render(write_still=True)
print(f"DONE: {OUTPUT_PATH}")
