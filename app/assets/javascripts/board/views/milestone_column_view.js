var WrapperView = require("./card_wrapper_view");

WrapperView = WrapperView.extend({
  classNames: ["card", "card--milestone"]
})

var CollectionView = Ember.CloakedCollectionView.extend({
  tagName:"ul",
  classNames: ["sortable"],
  classNameBindings:["isHovering:ui-sortable-hover"],
  attributeBindings: ["style"],
  style: Ember.computed.alias("controller.style"),
  content: Ember.computed.alias("controller.issues"),
  isHovering: false,
  setupDraggable: function(){
    var that = this;
    this.$().sortable({
      tolerance: 'pointer',
      connectWith:".sortable",
      placeholder: "ui-sortable-placeholder",
      items: "li.is-draggable",
      over: function () {
        that.set("isHovering", true);
      },
      out: function () {
        that.set("isHovering", false);
      },
      activate: function () {
        // that.get("controller").set("isHovering", true);
      },
      deactivate: function() {
        // that.get("controller").set("isHovering", false);
      }, 
      update: function (ev, ui) {

        var findViewData = function (element){
           return Em.View.views[$(element).attr("id")]
             .get("cardController");
        };

        var elements = $("> li", that.$()),
        index = elements.index(ui.item);

        if(index === -1) { return; }

        var first = index === 0,
        last = index === elements.size() - 1,
        currentElement = $(ui.item),
        currentData = findViewData(currentElement),
        beforeElement = elements.get(index ? index - 1 : index),
        beforeIndex = elements.index(beforeElement),
        beforeData = findViewData(beforeElement),
        afterElement = elements.get(elements.size() - 1 > index ? index + 1 : index),
        afterIndex = elements.index(afterElement),
        afterData = findViewData(afterElement),
        current = currentData.get("model._data.milestone_order") || currentData.get("model.number"),
        before = beforeData.get("model._data.milestone_order") || beforeData.get("model.number"),
        after = afterData.get("model._data.milestone_order") || afterData.get("model.number");

        var onCancel = function(){
          ui.sender.sortable('cancel');
        }

        if(first && last) {
          that.get("controller").cardMoved(currentData, currentData.get("model.number"), onCancel)
          return;
        }

        
        if(first) {
          that.get("controller").cardMoved(currentData, (after || 1)/2, onCancel);
          // dragged it to the top

        } else if (last) {
          // dragged to the bottom
          that.get("controller").cardMoved(currentData, (before + 1), onCancel);

        }  else {
          that.get("controller").cardMoved(currentData, (((after + before) || 1)/2), onCancel);
        }
      }
    })

  }.on("didInsertElement"),
  overrideViewClass: WrapperView,
  cloakView: 'cardMilestone',
  itemController: 'card'
})

var ColumnView = Ember.ContainerView.extend({
  classNameBindings:[":milestone","controller.cssClass",":column","isCollapsed:hb-state-collapsed","isHovering:hovering"],
  isCollapsed: Ember.computed.alias("controller.isCollapsed"),
  isHovering: Ember.computed.alias("controller.isHovering"),
  childViews: ["headerView","quickIssueView", CollectionView, "collapsedView"],
  headerView: Ember.View.extend({
    tagName: "h3",
    templateName: "milestoneColumnHeader",
    click: function(){
      this.get("controller").toggleProperty('isCollapsed')
    }
  }),
  quickIssueView: Ember.View.extend({
    templateName: "quickIssue",
    classNames: ["create-issue"],
    isVisible: function(){
      return this.get('controller.isCreateVisible');
    }.property('controller.isFirstColumn'),
  }),
  collapsedView: Ember.View.extend({
    classNames:["collapsed"],
    click: function(){
      this.get("controller").toggleProperty('isCollapsed')
    }
  }),

});

module.exports = ColumnView;
