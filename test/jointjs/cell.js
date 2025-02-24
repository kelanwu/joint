'use strict';

QUnit.module('cell', function(hooks) {

    hooks.beforeEach(function() {

        var $fixture = $('<div>', { id: 'qunit-fixture' }).appendTo(document.body);
        var $paper = $('<div/>');
        $fixture.append($paper);

        this.graph = new joint.dia.Graph;
        this.paper = new joint.dia.Paper({

            el: $paper,
            gridSize: 10,
            model: this.graph
        });
    });

    hooks.afterEach(function() {

        this.paper.remove();
        this.graph = null;
        this.paper = null;
    });

    QUnit.module('isElement()', function(hooks) {

        QUnit.test('should be a function', function(assert) {

            assert.equal(typeof joint.dia.Cell.prototype.isElement, 'function');
        });

        QUnit.test('should return FALSE', function(assert) {

            var cell = new joint.dia.Cell;

            assert.notOk(cell.isElement());
        });
    });

    QUnit.module('isLink()', function(hooks) {

        QUnit.test('should be a function', function(assert) {

            assert.equal(typeof joint.dia.Cell.prototype.isLink, 'function');
        });

        QUnit.test('should return FALSE', function(assert) {

            var cell = new joint.dia.Cell;

            assert.notOk(cell.isLink());
        });
    });

    QUnit.module('backbone attributes', function() {
        QUnit.test('idAttribute', function(assert) {
            var graph = this.graph;
            var paper = this.paper;
            var id = '123';
            var TestElement = joint.dia.Element.extend({
                idAttribute: 'myId'
            });
            var el = new TestElement({ myId: id, type: 'testType', markup: [] });
            // graph
            el.addTo(graph);
            assert.equal(el.id, id);
            assert.equal(el.get('myId'), id);
            assert.equal(el.get('id'), undefined);
            assert.equal(graph.getCell(id), el);
            var clone = el.clone();
            assert.ok(clone.id);
            assert.notEqual(clone.id, id);
            clone.addTo(graph);
            assert.equal(clone.get('myId'), clone.id);
            assert.equal(clone.get('id'), undefined);
            assert.equal(graph.getCell(clone.id), clone);
            // paper
            var elView = paper.findViewByModel(id);
            assert.ok(elView);
            assert.equal(elView.model, el);
            // change id
            var newId = '456';
            clone.set('myId', newId);
            assert.equal(graph.getCell(newId), clone);
        });
    });

    QUnit.module('lifecycle methods', function() {
        QUnit.test('sanity', function(assert) {
            var spyPreinitilize = sinon.spy(joint.dia.Cell.prototype, 'preinitialize');
            var spyInitilize = sinon.spy(joint.dia.Cell.prototype, 'initialize');
            new joint.dia.Cell({ testAttribute: true }, { testOption: true });
            assert.equal(spyPreinitilize.callCount, 1);
            assert.ok(spyPreinitilize.calledWithExactly({ testAttribute: true }, { testOption: true }));
            assert.equal(spyInitilize.callCount, 1);
            assert.ok(spyInitilize.calledWithExactly({ testAttribute: true }, { testOption: true }));
            assert.ok(spyPreinitilize.calledBefore(spyInitilize));
        });
    });

    QUnit.module('parent', function(hooks) {

        QUnit.test('parent', function(assert) {

            var cell = new joint.shapes.basic.Rect({
                position: { x: 20, y: 20 },
                size: { width: 60, height: 60 }
            });
            var cell2 = new joint.shapes.basic.Rect({
                position: { x: 20, y: 20 },
                size: { width: 60, height: 60 }
            });

            this.graph.addCell(cell);
            this.graph.addCell(cell2);

            assert.equal(typeof cell.parent, 'function', 'should be a function');

            var parent;

            cell.embed(cell2);

            parent = cell.parent();
            assert.equal(parent, undefined, 'parent cell has no parent');

            parent = cell2.parent();
            assert.equal(parent, cell.id, 'embedded cell has parent');

            cell.unembed(cell2);

            parent = cell.parent();
            assert.equal(parent, undefined, 'former parent cell still has no parent');

            parent = cell2.parent();
            assert.equal(parent, undefined, 'former embedded cell no longer has a parent');
        });
    });

    QUnit.module('getParentCell', function(hooks) {

        QUnit.test('getParentCell', function(assert) {

            var cell = new joint.shapes.basic.Rect({
                position: { x: 20, y: 20 },
                size: { width: 60, height: 60 }
            });
            var cell2 = new joint.shapes.basic.Rect({
                position: { x: 20, y: 20 },
                size: { width: 60, height: 60 }
            });

            this.graph.addCell(cell);
            this.graph.addCell(cell2);

            assert.equal(typeof cell.getParentCell, 'function', 'should be a function');

            var parent;

            cell.embed(cell2);

            parent = cell.getParentCell();
            assert.equal(parent, null, 'parent cell has no parent');

            parent = cell2.getParentCell();
            assert.ok(parent && parent.id === cell.id, 'embedded cell has parent');

            cell.unembed(cell2);

            parent = cell.getParentCell();
            assert.equal(parent, null, 'former parent cell still has no parent');

            parent = cell2.getParentCell();
            assert.equal(parent, null, 'former embedded cell no longer has a parent');
        });
    });

    QUnit.module('embed', function(hooks) {

        QUnit.test('recursive embed exception', function(assert) {

            var cell = new joint.shapes.basic.Rect({
                position: { x: 20, y: 20 },
                size: { width: 60, height: 60 }
            });
            var cell2 = new joint.shapes.basic.Rect({
                position: { x: 20, y: 20 },
                size: { width: 60, height: 60 }
            });

            this.graph.addCell(cell);
            this.graph.addCell(cell2);

            cell.embed(cell2);
            assert.raises(() => { cell2.embed(cell); }, /Recursive embedding not allowed/, 'throws exception on recursive embedding');
        });

        QUnit.test('embedding of an embedded cell exception', function(assert) {

            var cell = new joint.shapes.basic.Rect({
                position: { x: 20, y: 20 },
                size: { width: 60, height: 60 }
            });
            var cell2 = new joint.shapes.basic.Rect({
                position: { x: 20, y: 20 },
                size: { width: 60, height: 60 }
            });
            var cell3 = new joint.shapes.basic.Rect({
                position: { x: 20, y: 20 },
                size: { width: 60, height: 60 }
            });

            this.graph.addCell(cell);
            this.graph.addCell(cell2);
            this.graph.addCell(cell3);

            cell.embed(cell2);

            assert.raises(() => { cell3.embed(cell2); }, /Embedding of already embedded cells is not allowed/, 'throws exception on embedding of embedded cell');
        });
    });

    QUnit.module('remove attributes', function(hooks) {

        var /** @type joint.dia.Cell */
            el;
        var attributes;

        hooks.beforeEach(function() {
            el = new joint.dia.Element();
            attributes = el.attributes;
            attributes.attrs = {};
        });

        QUnit.module('removeProp', function(hooks) {

            QUnit.test('remove single property', function(assert) {

                attributes.a = 'aaa';
                el.removeProp('a');
                assert.notOk(attributes.hasOwnProperty('a'));
            });

            QUnit.test('remove nested property', function(assert) {

                attributes.a = [{ aa: 'aa' }, { bb: 'bb', cc: 'cc' }];
                el.removeProp('a/1/bb');
                assert.deepEqual(attributes.a[0], { aa: 'aa' });
                assert.deepEqual(attributes.a[1], { cc: 'cc' });
            });

            QUnit.module('define path as an array', function(hooks) {

                QUnit.test('remove item from array', function(assert) {

                    attributes.a = [{ aa: 'aa' }, { bb: 'bb', cc: 'cc' }];
                    el.removeProp(['a', 1, 'bb']);
                    assert.deepEqual(attributes.a[0], { aa: 'aa' });
                    assert.deepEqual(attributes.a[1], { cc: 'cc' });
                });
            });
        });

        QUnit.module('attr', function(hooks) {

            QUnit.test('path as array - set array item', function(assert) {
                el.attr(['array', 123], 'property');
                assert.ok(_.isArray(attributes.attrs.array));
                assert.equal(attributes.attrs.array[123], 'property');
            });

            QUnit.test('path as array - set object property', function(assert) {
                el.attr(['object', '123'], 'property');
                assert.deepEqual(attributes.attrs.object,  { '123': 'property' });
            });

            QUnit.test('set attr as an object', function(assert) {
                el.attr({ 'object': { '123': 'property' }});
                assert.deepEqual(attributes.attrs.object,  { '123': 'property' });
            });

            QUnit.test('get object property', function(assert) {
                attributes.attrs.object = {
                    '123': 'property'
                };
                assert.equal(el.attr('object/123'), 'property');
            });
        });

        QUnit.module('removeAttr', function(hooks) {

            QUnit.test('path defines as array', function(assert) {

                attributes.attrs.a = {
                    b: {
                        c: 'deep_c'
                    }
                };
                attributes.attrs.c = 'root_c';
                attributes.attrs.b = 'root_b';
                el.removeAttr(['a', 'b', 'c']);
                assert.deepEqual(attributes.attrs, { a: { b: {}}, b: 'root_b', c: 'root_c' }, 'deep_c is removed');
            });

            QUnit.test('path defines as array - delimiter in name', function(assert) {

                attributes.attrs['a/b'] = {
                    c: 'deep_c'
                };
                attributes.attrs.c = 'root_c';
                attributes.attrs.b = 'root_b';
                el.removeAttr(['a/b', 'c']);
                assert.deepEqual(attributes.attrs, { 'a/b': {} , b: 'root_b', c: 'root_c' }, 'deep_c is removed');
            });

            QUnit.test('path defines as string', function(assert) {

                attributes.attrs.a = {
                    b: {
                        c: 'deep_c'
                    }
                };
                attributes.attrs.c = 'root_c';
                attributes.attrs.b = 'root_b';
                el.removeAttr('a/b/c');
                assert.deepEqual(attributes.attrs, { a: { b: {}}, b: 'root_b', c: 'root_c' }, 'deep_c is removed');
            });
        });
    });

    QUnit.module('prop()', function(hooks) {

        var /** @type joint.dia.Cell */
            el;
        var attrs;

        hooks.beforeEach(function() {

            el = new joint.shapes.basic.Rect();
            attrs = el.attributes;
        });

        QUnit.test('empty key', function(assert) {

            el.prop('', 'john');
            assert.equal(attrs[''], 'john');
            assert.equal(el.prop(''), 'john');
        });

        QUnit.module('arrays', function(hooks) {

            QUnit.test('path as string', function(assert) {

                el.prop('array/123', 'index');

                assert.ok(_.isArray(attrs.array));

                assert.equal(attrs.array.length, 124);
                assert.equal(attrs.array[123], 'index');
            });

            QUnit.test('path as array', function(assert) {

                el.prop(['array', 123], 'index');
                var arr = el.get('array');

                assert.ok(_.isArray(arr), 'it is an array');
                assert.equal(arr.length, 124, 'length is set correctly');
                assert.equal(arr[123], 'index');

                assert.equal(el.prop('array/123'), 'index');
                assert.equal(el.prop(['array', 123]), 'index');
                assert.equal(el.prop(['array', '123']), 'index');
            });

            QUnit.test('nested arrays', function(assert) {

                el.prop('mylist/0/data/0/value', 50);

                assert.ok(attrs.hasOwnProperty('mylist'));
                assert.equal(attrs.mylist[0].data[0].value, 50);

                assert.equal(el.prop('mylist/0/data/0/value'), 50);
            });

            QUnit.test('nested arrays - path as array', function(assert) {

                el.prop(['mylist', 0, 'data', 0, 'value'], 50);

                assert.ok(attrs.hasOwnProperty('mylist'));
                assert.equal(attrs.mylist[0].data[0].value, 50);

                assert.equal(el.prop('mylist/0/data/0/value'), 50);
            });
        });

        QUnit.module('objects', function(hooks) {

            QUnit.test('path as string', function(assert) {

                el.prop('name/first', 'john');
                assert.ok(attrs.hasOwnProperty('name'));
                assert.equal(attrs.name.first, 'john');

                assert.equal(el.prop('name/first'), 'john');
            });

            QUnit.test('path and value as object', function(assert) {

                el.prop({ name: { first: 'john' }});
                assert.ok(attrs.hasOwnProperty('name'));
                assert.equal(attrs.name.first, 'john');

                assert.equal(el.prop('name/first'), 'john');
            });

            QUnit.test('path as array - root level', function(assert) {

                el.prop(['object'], 'property');

                assert.equal(attrs.object, 'property');
                assert.equal(el.prop('object'), 'property');
            });

            QUnit.test('path as array', function(assert) {

                el.prop(['object', '123'], 'property');

                assert.ok(_.isPlainObject(attrs.object));
                assert.ok(attrs.object.hasOwnProperty('123'));
                assert.equal(attrs.object['123'], 'property');

                assert.equal(el.prop('object/123'), 'property');
            });

            QUnit.test('path as array - sepatator included in name', function(assert) {

                el.prop(['ob/ject', '123'], 'property');

                assert.ok(_.isPlainObject(attrs['ob/ject']));
                assert.ok(attrs['ob/ject'].hasOwnProperty('123'));
                assert.equal(attrs['ob/ject']['123'], 'property');

                assert.equal(el.prop(['ob/ject', '123']), 'property');
            });
        });
    });

    QUnit.module('toJSON()', function() {

        QUnit.test('`defaults` defined as property', function(assert) {

            var El = joint.dia.Element.extend({
                defaults: {
                    attrs: { test1: { prop1: true }}
                }
            });

            var el = new El({
                id: 'el1',
                attrs: { test1: { prop1: true }, test2: { prop2: true }}
            });

            assert.deepEqual(el.toJSON(), { id: 'el1', attrs: { test2: { prop2: true }}});
        });

        QUnit.test('`defaults()` defined as function', function(assert) {
            var El = joint.dia.Element.extend({
                defaults: function() {
                    return {
                        attrs: { test1: { prop1: true }}
                    };
                }
            });

            var el = new El({
                id: 'el1',
                attrs: { test1: { prop1: true }, test2: { prop2: true }}
            });

            assert.deepEqual(el.toJSON(), { id: 'el1', attrs: { test2: { prop2: true }}});
        });
    });

    QUnit.module('relative vs absolute points', function() {

        QUnit.test('getRelativePointFromAbsolute()', function(assert) {
            var res;
            var point = { x: 130, y: 130 };
            var el = new joint.dia.Element({
                size: { width: 30, height: 30 },
                position: { x: 100, y: 100 },
                angle: 0
            });
            // 0
            res = el.getRelativePointFromAbsolute(point.x, point.y);
            assert.equal(res.round().toString(), '30@30');
            res = el.getRelativePointFromAbsolute(point);
            assert.equal(res.round().toString(), '30@30');
            // 90
            el.rotate(90);
            res = el.getRelativePointFromAbsolute(point.x, point.y);
            assert.equal(res.round().toString(), '30@0');
            res = el.getRelativePointFromAbsolute(point);
            assert.equal(res.round().toString(), '30@0');
            // -90
            el.rotate(-180);
            res = el.getRelativePointFromAbsolute(point.x, point.y);
            assert.equal(res.round().toString(), '0@30');
            res = el.getRelativePointFromAbsolute(point);
            assert.equal(res.round().toString(), '0@30');
        });

        QUnit.test('getAbsolutePointFromAbsolute()', function(assert) {
            var res;
            var point = { x: 30, y: 30 };
            var el = new joint.dia.Element({
                size: { width: 30, height: 30 },
                position: { x: 100, y: 100 },
                angle: 0
            });
            // 0
            res = el.getAbsolutePointFromRelative(point.x, point.y);
            assert.equal(res.round().toString(), '130@130');
            res = el.getAbsolutePointFromRelative(point);
            assert.equal(res.round().toString(), '130@130');
            // 90
            el.rotate(90);
            res = el.getAbsolutePointFromRelative(point.x, point.y);
            assert.equal(res.round().toString(), '100@130');
            res = el.getAbsolutePointFromRelative(point);
            assert.equal(res.round().toString(), '100@130');
            // -90
            el.rotate(-180);
            res = el.getAbsolutePointFromRelative(point.x, point.y);
            assert.equal(res.round().toString(), '130@100');
            res = el.getAbsolutePointFromRelative(point);
            assert.equal(res.round().toString(), '130@100');
        });
    });

});

