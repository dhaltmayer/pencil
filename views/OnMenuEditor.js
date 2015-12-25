function OnMenuEditor() {
}
OnMenuEditor.prototype.install = function (canvas) {
    this.canvas = canvas;
    this.canvas.contextMenuEditor = this;

};
OnMenuEditor.prototype.attach = function (targetObject) {
    this.targetObject = targetObject;
};
OnMenuEditor.prototype.invalidate = function () {
};
OnMenuEditor.prototype.dettach = function () {
};
OnMenuEditor.prototype.generateMenuItems = function () {
    var definedGroups = this.targetObject.getPropertyGroups();
    var items = [];
    var thiz = this;
    for (var i in definedGroups) {
        var group = definedGroups[i];

        for (var j in group.properties) {
            var property = group.properties[j];
            if (property.type == Bool) {
                var item = {
                    type: "Toggle",
                    label: property.displayName,
                    checked: this.targetObject.getProperty(property.name).value,
                    property: property.name,
                    handleAction: function (checked) {
                        var bool = Bool.fromString("" + checked);
                        thiz.targetObject.setProperty(this.property, bool);
                    }
                };
                items.push(item);
            } else if (property.type == Enum) {
                var enumItem = {
                    type: "SubMenu",
                    label: property.displayName,
                    subItems: []
                }
                var value = thiz.targetObject.getProperty(property.name);
                var enumValues = Enum.getValues(property);
                for (var i in enumValues) {
                    var enumValue = enumValues[i];
                    var checked = value && value.equals(enumValue.value);
                    enumItem.subItems.push({
                        label: enumValue.label,
                        value: enumValue.value,
                        type: "Selection",
                        checked: checked,
                        property: property.name,
                        handleAction: function (checked) {
                            if (!checked) return;
                            thiz.targetObject.setProperty(this.property, new Enum(this.value));
                        }
                    });
                }
                items.push(enumItem);
            }
        }
    }

    //actions
    var actionItem = null;
    if (this.targetObject.def && this.targetObject.performAction) {
        for (var i in this.targetObject.def.actions) {
            var action = this.targetObject.def.actions[i];
            if (action.displayName) {
                console.log("action: ", action);
                if (!actionItem) {
                    actionItem = {
                        label: "Action",
                        type: "SubMenu",
                        subItems: []
                    }
                }
                actionItem.subItems.push({
                    label: action.displayName,
                    type: "Normal",
                    actionId: action.id,
                    handleAction: function (){
                        thiz.targetObject.performAction(this.actionId);
                        thiz.canvas.invalidateEditors();
                    }
                });
            }
        }
    }

    if (actionItem) {
        items.push(actionItem);
    }
    return items;
};

Pencil.registerEditor(OnMenuEditor);