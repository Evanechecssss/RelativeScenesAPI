function AtanizeScene(frames, actions, params) {
    var root = null;
    var i = 0;
    var theta_degrees = null;
    var theta = null;

    frames.forEach(function (frame) {
        var point = new Vector3f(frame.x, frame.y, frame.z);
        if (i == 0) {
            root = setRootPoint(root, point);
        }
        var delta = new Vector3f(point.x - root.x, point.y - root.y, point.z - root.z);

        if (theta == null && root.equals(point)==false)
        {
            var n_delta = new Vector2f(Math.abs(delta.x), delta.z)
            var axle = new Vector2f(0,1)
            n_delta.normalize()

            if (delta.x<0)
            {
                params.side=-1
            }
            theta = n_delta.angle(axle)
            theta_degrees = theta * 180 / Math.PI
        }

        var cos = Math.cos(theta);
        var sin = Math.sin(theta);
        var xx = delta.x * cos + (params.side*-1)*(delta.z * sin);
        var zz = (params.side)*delta.x * sin + delta.z * cos;
        delta.x = xx;
        delta.z = zz;
        frame.yaw += theta_degrees;
        frame.yawHead += theta_degrees;
        if (frame.hasBodyYaw) {
            frame.bodyYaw += theta_degrees;
        }
        frame.x = root.x + delta.x;
        frame.y = root.y + delta.y;
        frame.z = root.z+delta.z;
        i++;
    });
    actions.forEach(function (a_actions) {
        if (a_actions == null || a_actions.isEmpty()) {
            return;
        }
        a_actions.forEach(function (action) {
            action.changeOrigin(theta_degrees, root.x, root.y, root.z, root.x, root.y, root.z);
        });
    });
    return [frames, actions];
}