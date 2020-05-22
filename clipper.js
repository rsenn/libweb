/*******************************************************************************
 *                                                                              *
 * Author    :  Angus Johnson                                                   *
 * Version   :  6.4.2                                                           *
 * Date      :  27 February 2017                                                *
 * Website   :  http://www.angusj.com                                           *
 * Copyright :  Angus Johnson 2010-2017                                         *
 *                                                                              *
 * License:                                                                     *
 * Use, modification & distribution is subject to Boost Software License Ver 1. *
 * http://www.boost.org/LICENSE_1_0.txt                                         *
 *                                                                              *
 * Attributions:                                                                *
 * The code in this library is an extension of Bala Vatti's clipping algorithm: *
 * "A generic solution to polygon clipping"                                     *
 * Communications of the ACM, Vol 35, Issue 7 (July 1992) pp 56-63.             *
 * http://portal.acm.org/citation.cfm?id=129906                                 *
 *                                                                              *
 * Computer graphics and geometric modeling: implementation and algorithms      *
 * By Max K. Agoston                                                            *
 * Springer; 1 edition (January 4, 2005)                                        *
 * http://books.google.com/books?q=vatti+clipping+agoston                       *
 *                                                                              *
 * See also:                                                                    *
 * "Polygon Offsetting by Computing Winding Numbers"                            *
 * Paper no. DETC2005-85513 pp. 565-575                                         *
 * ASME 2005 International Design Engineering Technical Conferences             *
 * and Computers and Information in Engineering Conference (IDETC/CIE2005)      *
 * September 24-28, 2005 , Long Beach, California, USA                          *
 * http://www.me.berkeley.edu/~mcmains/pubs/DAC05OffsetPolygon.pdf              *
 *                                                                              *
 *******************************************************************************/
/*******************************************************************************
 *                                                                              *
 * Author    :  Timo                                                            *
 * Version   :  6.4.2.2 (FPoint)                                                *
 * Date      :  8 September 2017                                                *
 *                                                                              *
 * This is a translation of the C# Clipper library to Javascript.               *
 *                                                                              *
 *******************************************************************************/
'use strict';

export const ClipperLib = {};

export const version = (ClipperLib.version = '6.4.2.2');

//UseLines: Enables open path clipping. Adds a very minor cost to performance.
export const use_lines = (ClipperLib.use_lines = true);

//use_xyz: adds a z member to FPoint. Adds a minor cost to performance.
export const use_xyz = (ClipperLib.use_xyz = false);
/*
var isNode = false;
if(typeof module !== 'undefined' && module.exports) {
  module.exports = ClipperLib;
  isNode = true;
} else {
  if(typeof document !== 'undefined') window.ClipperLib = ClipperLib;
  else global['ClipperLib'] = ClipperLib;
}

var navigator_appName;
if(!isNode) {
  var nav = navigator.userAgent.toString().toLowerCase();
  navigator_appName = navigator.appName;
} else {
  var nav = 'chrome'; // Node.js uses Chrome's V8 engine
  navigator_appName = 'Netscape'; // Firefox, Chrome and Safari returns "Netscape", so Node.js should also
}
// Browser test to speedup performance critical functions
var browser = {};

if(nav.indexOf('chrome') != -1 && nav.indexOf('chromium') == -1) browser.chrome = 1;
else browser.chrome = 0;
if(nav.indexOf('chromium') != -1) browser.chromium = 1;
else browser.chromium = 0;
if(nav.indexOf('safari') != -1 && nav.indexOf('chrome') == -1 && nav.indexOf('chromium') == -1)
  browser.safari = 1;
else browser.safari = 0;
if(nav.indexOf('firefox') != -1) browser.firefox = 1;
else browser.firefox = 0;
if(nav.indexOf('firefox/17') != -1) browser.firefox17 = 1;
else browser.firefox17 = 0;
if(nav.indexOf('firefox/15') != -1) browser.firefox15 = 1;
else browser.firefox15 = 0;
if(nav.indexOf('firefox/3') != -1) browser.firefox3 = 1;
else browser.firefox3 = 0;
if(nav.indexOf('opera') != -1) browser.opera = 1;
else browser.opera = 0;
if(nav.indexOf('msie 10') != -1) browser.msie10 = 1;
else browser.msie10 = 0;
if(nav.indexOf('msie 9') != -1) browser.msie9 = 1;
else browser.msie9 = 0;
if(nav.indexOf('msie 8') != -1) browser.msie8 = 1;
else browser.msie8 = 0;
if(nav.indexOf('msie 7') != -1) browser.msie7 = 1;
else browser.msie7 = 0;
if(nav.indexOf('msie ') != -1) browser.msie = 1;
else browser.msie = 0;
*/
// Here starts the actual Clipper library:
// Helper function to support Inheritance in Javascript
var Inherit = function(ce, ce2) {
  var p;
  if(typeof Object.getOwnPropertyNames === 'undefined') {
    for(p in ce2.prototype)
      if(typeof ce.prototype[p] === 'undefined' || ce.prototype[p] === Object.prototype[p])
        ce.prototype[p] = ce2.prototype[p];
    for(p in ce2) if(typeof ce[p] === 'undefined') ce[p] = ce2[p];
    ce.$baseCtor = ce2;
  } else {
    var props = Object.getOwnPropertyNames(ce2.prototype);
    for(var i = 0; i < props.length; i++)
      if(typeof Object.getOwnPropertyDescriptor(ce.prototype, props[i]) === 'undefined')
        Object.defineProperty(
          ce.prototype,
          props[i],
          Object.getOwnPropertyDescriptor(ce2.prototype, props[i])
        );
    for(p in ce2) if(typeof ce[p] === 'undefined') ce[p] = ce2[p];
    ce.$baseCtor = ce2;
  }
};

/**
 * @constructor
 */
export const Path = (ClipperLib.Path = function() {
  return [];
});

Path.prototype.push = Array.prototype.push;

/**
 * @constructor
 */
export const Paths = (ClipperLib.Paths = function() {
  return []; // Was previously [[]], but caused problems when pushed
});

Paths.prototype.push = Array.prototype.push;

// PolyTree & PolyNode start
/**
 * @suppress {missingProperties}
 */
export const PolyNode = (ClipperLib.PolyNode = function() {
  this.m_Parent = null;
  this.m_polygon = new Path();
  this.m_Index = 0;
  this.m_jointype = 0;
  this.m_endtype = 0;
  this.m_Childs = [];
  this.IsOpen = false;
});

PolyNode.prototype.IsHoleNode = function() {
  var result = true;
  var node = this.m_Parent;
  while(node !== null) {
    result = !result;
    node = node.m_Parent;
  }
  return result;
};

PolyNode.prototype.ChildCount = function() {
  return this.m_Childs.length;
};

PolyNode.prototype.Contour = function() {
  return this.m_polygon;
};

PolyNode.prototype.AddChild = function(Child) {
  var cnt = this.m_Childs.length;
  this.m_Childs.push(Child);
  Child.m_Parent = this;
  Child.m_Index = cnt;
};

PolyNode.prototype.GetNext = function() {
  if(this.m_Childs.length > 0) return this.m_Childs[0];
  else return this.GetNextSiblingUp();
};

PolyNode.prototype.GetNextSiblingUp = function() {
  if(this.m_Parent === null) return null;
  else if(this.m_Index === this.m_Parent.m_Childs.length - 1)
    return this.m_Parent.GetNextSiblingUp();
  else return this.m_Parent.m_Childs[this.m_Index + 1];
};

PolyNode.prototype.Childs = function() {
  return this.m_Childs;
};

PolyNode.prototype.Parent = function() {
  return this.m_Parent;
};

PolyNode.prototype.IsHole = function() {
  return this.IsHoleNode();
};

// PolyTree : PolyNode
/**
 * @suppress {missingProperties}
 * @constructor
 */
export const PolyTree = (ClipperLib.PolyTree = function() {
  this.m_AllPolys = [];
  PolyNode.call(this);
});

PolyTree.prototype.Clear = function() {
  for(var i = 0, ilen = this.m_AllPolys.length; i < ilen; i++) this.m_AllPolys[i] = null;
  this.m_AllPolys.length = 0;
  this.m_Childs.length = 0;
};

PolyTree.prototype.GetFirst = function() {
  if(this.m_Childs.length > 0) return this.m_Childs[0];
  else return null;
};

PolyTree.prototype.Total = function() {
  var result = this.m_AllPolys.length;
  //with negative offsets, ignore the hidden outer polygon ...
  if(result > 0 && this.m_Childs[0] !== this.m_AllPolys[0]) result--;
  return result;
};

Inherit(PolyTree, PolyNode);

// PolyTree & PolyNode end

export const Clear = (ClipperLib.Clear = function(a) {
  a.length = 0;
});

//ClipperLib.MaxSteps = 64; // How many steps at maximum in arc in BuildArc() function
export const PI = (ClipperLib.PI = 3.141592653589793);
export const PI2 = (ClipperLib.PI2 = 2 * 3.141592653589793);
/**
 * @constructor
 */
export const FPoint = (ClipperLib.FPoint = function() {
  var a = arguments,
    alen = a.length;
  this.x = 0;
  this.y = 0;
  if(use_xyz) {
    this.z = 0;
    if(alen === 3) {
      // public FPoint(cInt x, cInt y, cInt z = 0)
      this.x = a[0];
      this.y = a[1];
      this.z = a[2];
    } else if(alen === 2) {
      // public FPoint(cInt x, cInt y)
      this.x = a[0];
      this.y = a[1];
      this.z = 0;
    } else if(alen === 1) {
      if(a[0] instanceof FPoint) {
        // public FPoint(FPoint dp)
        var dp = a[0];
        this.x = dp.x;
        this.y = dp.y;
        this.z = 0;
      } // public FPoint(FPoint pt)
      else {
        var pt = a[0];
        if(typeof pt.z === 'undefined') pt.z = 0;
        this.x = pt.x;
        this.y = pt.y;
        this.z = pt.z;
      }
    } // public FPoint()
    else {
      this.x = 0;
      this.y = 0;
      this.z = 0;
    }
  } // if(!use_xyz)
  else {
    if(alen === 2) {
      // public FPoint(cInt x, cInt y)
      this.x = a[0];
      this.y = a[1];
    } else if(alen === 1) {
      if(a[0] instanceof FPoint) {
        // public FPoint(FPoint dp)
        var dp = a[0];
        this.x = dp.x;
        this.y = dp.y;
      } // public FPoint(FPoint pt)
      else {
        var pt = a[0];
        this.x = pt.x;
        this.y = pt.y;
      }
    } // public FPoint(FPoint pt)
    else {
      this.x = 0;
      this.y = 0;
    }
  }
});

FPoint.op_Equality = function(a, b) {
  //return a == b;
  return a.x === b.x && a.y === b.y;
};

FPoint.op_Inequality = function(a, b) {
  //return a !== b;
  return a.x !== b.x || a.y !== b.y;
};

/*
  FPoint.prototype.Equals = function (obj)
  {
    if(obj === null)
        return false;
    if(obj instanceof FPoint)
    {
        var a = Cast(obj, FPoint);
        return (this.x == a.x) && (this.y == a.y);
    }
    else
        return false;
  };

	*/

/**
 * @constructor
 */
export const FPoint0 = (ClipperLib.FPoint0 = function() {
  this.x = 0;
  this.y = 0;
  if(use_xyz) this.z = 0;
});

FPoint0.prototype = FPoint.prototype;

/**
 * @constructor
 */
export const FPoint1 = (ClipperLib.FPoint1 = function(pt) {
  this.x = pt.x;
  this.y = pt.y;
  if(use_xyz) {
    if(typeof pt.z === 'undefined') this.z = 0;
    else this.z = pt.z;
  }
});

FPoint1.prototype = FPoint.prototype;

/**
 * @constructor
 */
export const FPoint1dp = (ClipperLib.FPoint1dp = function(dp) {
  this.x = dp.x;
  this.y = dp.y;
  if(use_xyz) this.z = 0;
});

FPoint1dp.prototype = FPoint.prototype;

/**
 * @constructor
 */
export const FPoint2 = (ClipperLib.FPoint2 = function(x, y, z) {
  this.x = x;
  this.y = y;
  if(use_xyz) {
    if(typeof z === 'undefined') this.z = 0;
    else this.z = z;
  }
});

FPoint2.prototype = FPoint.prototype;

/**
 * @constructor
 */
export const FRect = (ClipperLib.FRect = function() {
  var a = arguments,
    alen = a.length;
  if(alen === 4) {
    // function (l, t, r, b)
    this.left = a[0];
    this.top = a[1];
    this.right = a[2];
    this.bottom = a[3];
  } else if(alen === 1) {
    // function (ir)
    var ir = a[0];
    this.left = ir.left;
    this.top = ir.top;
    this.right = ir.right;
    this.bottom = ir.bottom;
  } // function ()
  else {
    this.left = 0;
    this.top = 0;
    this.right = 0;
    this.bottom = 0;
  }
});

/**
 * @constructor
 */
export const FRect0 = (ClipperLib.FRect0 = function() {
  this.left = 0;
  this.top = 0;
  this.right = 0;
  this.bottom = 0;
});

FRect0.prototype = FRect.prototype;

/**
 * @constructor
 */
export const FRect1 = (ClipperLib.FRect1 = function(ir) {
  this.left = ir.left;
  this.top = ir.top;
  this.right = ir.right;
  this.bottom = ir.bottom;
});

FRect1.prototype = FRect.prototype;

/**
 * @constructor
 */
export const FRect4 = (ClipperLib.FRect4 = function(l, t, r, b) {
  this.left = l;
  this.top = t;
  this.right = r;
  this.bottom = b;
});

FRect4.prototype = FRect.prototype;

export const ClipType = (ClipperLib.ClipType = {
  ctIntersection: 0,
  ctUnion: 1,
  ctDifference: 2,
  ctXor: 3
});

export const PolyType = (ClipperLib.PolyType = {
  ptSubject: 0,
  ptClip: 1
});

export const PolyFillType = (ClipperLib.PolyFillType = {
  pftEvenOdd: 0,
  pftNonZero: 1,
  pftPositive: 2,
  pftNegative: 3
});

export const JoinType = (ClipperLib.JoinType = {
  jtSquare: 0,
  jtRound: 1,
  jtMiter: 2
});

export const EndType = (ClipperLib.EndType = {
  etOpenSquare: 0,
  etOpenRound: 1,
  etOpenButt: 2,
  etClosedLine: 3,
  etClosedPolygon: 4
});

export const EdgeSide = (ClipperLib.EdgeSide = {
  esLeft: 0,
  esRight: 1
});

export const Direction = (ClipperLib.Direction = {
  dRightToLeft: 0,
  dLeftToRight: 1
});

/**
 * @constructor
 */
export const TEdge = (ClipperLib.TEdge = function() {
  this.Bot = new FPoint0();
  this.Curr = new FPoint0(); //current (updated for every new scanbeam)
  this.Top = new FPoint0();
  this.Delta = new FPoint0();
  this.Dx = 0;
  this.PolyTyp = PolyType.ptSubject;
  this.Side = EdgeSide.esLeft; //side only refers to current side of solution poly
  this.WindDelta = 0; //1 or -1 depending on winding direction
  this.WindCnt = 0;
  this.WindCnt2 = 0; //winding count of the opposite polytype
  this.OutIdx = 0;
  this.Next = null;
  this.Prev = null;
  this.NextInLML = null;
  this.NextInAEL = null;
  this.PrevInAEL = null;
  this.NextInSEL = null;
  this.PrevInSEL = null;
});

/**
 * @constructor
 */
export const IntersectNode = (ClipperLib.IntersectNode = function() {
  this.Edge1 = null;
  this.Edge2 = null;
  this.Pt = new FPoint0();
});

export const MyIntersectNodeSort = (ClipperLib.MyIntersectNodeSort = function() {});

MyIntersectNodeSort.Compare = function(node1, node2) {
  var i = node2.Pt.y - node1.Pt.y;
  if(i > 0) return 1;
  else if(i < 0) return -1;
  else return 0;
};

/**
 * @constructor
 */
export const LocalMinima = (ClipperLib.LocalMinima = function() {
  this.y = 0;
  this.LeftBound = null;
  this.RightBound = null;
  this.Next = null;
});

/**
 * @constructor
 */
export const Scanbeam = (ClipperLib.Scanbeam = function() {
  this.y = 0;
  this.Next = null;
});

/**
 * @constructor
 */
export const Maxima = (ClipperLib.Maxima = function() {
  this.x = 0;
  this.Next = null;
  this.Prev = null;
});

//OutRec: contains a path in the clipping solution. Edges in the AEL will
//carry a pointer to an OutRec when they are part of the clipping solution.
/**
 * @constructor
 */
export const OutRec = (ClipperLib.OutRec = function() {
  this.Idx = 0;
  this.IsHole = false;
  this.IsOpen = false;
  this.FirstLeft = null; //see comments in clipper.pas
  this.Pts = null;
  this.BottomPt = null;
  this.PolyNode = null;
});

/**
 * @constructor
 */
export const OutPt = (ClipperLib.OutPt = function() {
  this.Idx = 0;
  this.Pt = new FPoint0();
  this.Next = null;
  this.Prev = null;
});

/**
 * @constructor
 */
export const Join = (ClipperLib.Join = function() {
  this.OutPt1 = null;
  this.OutPt2 = null;
  this.OffPt = new FPoint0();
});

export const ClipperBase = (ClipperLib.ClipperBase = function() {
  this.m_MinimaList = null;
  this.m_CurrentLM = null;
  this.m_edges = new Array();
  this.m_HasOpenPaths = false;
  this.PreserveCollinear = false;
  this.m_Scanbeam = null;
  this.m_PolyOuts = null;
  this.m_ActiveEdges = null;
});

ClipperBase.horizontal = -3.4e38;
ClipperBase.Skip = -2;
ClipperBase.Unassigned = -1;
ClipperBase.tolerance = 1e-20;

// The MAX_VALUE property has a value of 1.7976931348623157e+308. Values larger than MAX_VALUE are represented as "Infinity".
//MIN_VALUE has a value of 5e-324. Values smaller than MIN_VALUE ("underflow values") are converted to 0.
ClipperBase.maxValue = Math.sqrt(Number.MAX_VALUE); // 1.3407807929942596e+154
ClipperBase.minValue = Math.sqrt(Number.MIN_VALUE); // 2.2227587494850775e-162

ClipperBase.near_zero = function(val) {
  return val > -ClipperBase.tolerance && val < ClipperBase.tolerance;
};

ClipperBase.IsHorizontal = function(e) {
  return e.Delta.y === 0;
};

ClipperBase.prototype.PointIsVertex = function(pt, pp) {
  var pp2 = pp;
  do {
    if(FPoint.op_Equality(pp2.Pt, pt)) return true;
    pp2 = pp2.Next;
  } while(pp2 !== pp);
  return false;
};

ClipperBase.prototype.PointOnLineSegment = function(pt, linePt1, linePt2) {
  return (
    (pt.x === linePt1.x && pt.y === linePt1.y) ||
    (pt.x === linePt2.x && pt.y === linePt2.y) ||
    (pt.x > linePt1.x === pt.x < linePt2.x &&
      pt.y > linePt1.y === pt.y < linePt2.y &&
      (pt.x - linePt1.x) * (linePt2.y - linePt1.y) === (linePt2.x - linePt1.x) * (pt.y - linePt1.y))
  );
};

ClipperBase.prototype.PointOnPolygon = function(pt, pp) {
  var pp2 = pp;
  while(true) {
    if(this.PointOnLineSegment(pt, pp2.Pt, pp2.Next.Pt)) return true;
    pp2 = pp2.Next;
    if(pp2 === pp) break;
  }
  return false;
};

ClipperBase.prototype.SlopesEqual = ClipperBase.SlopesEqual = function() {
  var a = arguments,
    alen = a.length;
  var e1, e2, pt1, pt2, pt3, pt4;
  if(alen === 2) {
    // function (e1, e2)
    e1 = a[0];
    e2 = a[1];
    return e1.Delta.y * e2.Delta.x === e1.Delta.x * e2.Delta.y;
  } else if(alen === 3) {
    // function (pt1, pt2, pt3)
    pt1 = a[0];
    pt2 = a[1];
    pt3 = a[2];
    return (pt1.y - pt2.y) * (pt2.x - pt3.x) - (pt1.x - pt2.x) * (pt2.y - pt3.y) === 0;
  } // function (pt1, pt2, pt3, pt4)
  else {
    pt1 = a[0];
    pt2 = a[1];
    pt3 = a[2];
    pt4 = a[3];
    return (pt1.y - pt2.y) * (pt3.x - pt4.x) - (pt1.x - pt2.x) * (pt3.y - pt4.y) === 0;
  }
};

ClipperBase.SlopesEqual3 = function(e1, e2) {
  return e1.Delta.y * e2.Delta.x === e1.Delta.x * e2.Delta.y;
};

ClipperBase.SlopesEqual4 = function(pt1, pt2, pt3) {
  return (pt1.y - pt2.y) * (pt2.x - pt3.x) - (pt1.x - pt2.x) * (pt2.y - pt3.y) === 0;
};

ClipperBase.SlopesEqual5 = function(pt1, pt2, pt3, pt4) {
  return (pt1.y - pt2.y) * (pt3.x - pt4.x) - (pt1.x - pt2.x) * (pt3.y - pt4.y) === 0;
};

ClipperBase.prototype.Clear = function() {
  this.DisposeLocalMinimaList();
  for(var i = 0, ilen = this.m_edges.length; i < ilen; ++i) {
    for(var j = 0, jlen = this.m_edges[i].length; j < jlen; ++j) this.m_edges[i][j] = null;
    Clear(this.m_edges[i]);
  }
  Clear(this.m_edges);
  this.m_HasOpenPaths = false;
};

ClipperBase.prototype.DisposeLocalMinimaList = function() {
  while(this.m_MinimaList !== null) {
    var tmpLm = this.m_MinimaList.Next;
    this.m_MinimaList = null;
    this.m_MinimaList = tmpLm;
  }
  this.m_CurrentLM = null;
};

ClipperBase.prototype.RangeTest = function(pt) {
  if(
    pt.x > ClipperBase.maxValue ||
    pt.x < -ClipperBase.maxValue ||
    pt.y > ClipperBase.maxValue ||
    pt.y < -ClipperBase.maxValue ||
    (pt.x > 0 && pt.x < ClipperBase.minValue) ||
    (pt.y > 0 && pt.y < ClipperBase.minValue) ||
    (pt.x < 0 && pt.x > -ClipperBase.minValue) ||
    (pt.y < 0 && pt.y > -ClipperBase.minValue)
  )
    ClipperLib.Error('Coordinate outside allowed range in RangeTest().');
};

ClipperBase.prototype.InitEdge = function(e, eNext, ePrev, pt) {
  e.Next = eNext;
  e.Prev = ePrev;
  //e.Curr = pt;
  e.Curr.x = pt.x;
  e.Curr.y = pt.y;
  if(use_xyz) e.Curr.z = pt.z;
  e.OutIdx = -1;
};

ClipperBase.prototype.InitEdge2 = function(e, polyType) {
  if(e.Curr.y >= e.Next.Curr.y) {
    //e.Bot = e.Curr;
    e.Bot.x = e.Curr.x;
    e.Bot.y = e.Curr.y;
    if(use_xyz) e.Bot.z = e.Curr.z;
    //e.Top = e.Next.Curr;
    e.Top.x = e.Next.Curr.x;
    e.Top.y = e.Next.Curr.y;
    if(use_xyz) e.Top.z = e.Next.Curr.z;
  } else {
    //e.Top = e.Curr;
    e.Top.x = e.Curr.x;
    e.Top.y = e.Curr.y;
    if(use_xyz) e.Top.z = e.Curr.z;
    //e.Bot = e.Next.Curr;
    e.Bot.x = e.Next.Curr.x;
    e.Bot.y = e.Next.Curr.y;
    if(use_xyz) e.Bot.z = e.Next.Curr.z;
  }
  this.SetDx(e);
  e.PolyTyp = polyType;
};

ClipperBase.prototype.FindNextLocMin = function(E) {
  var E2;
  for(;;) {
    while(FPoint.op_Inequality(E.Bot, E.Prev.Bot) || FPoint.op_Equality(E.Curr, E.Top)) E = E.Next;
    if(E.Dx !== ClipperBase.horizontal && E.Prev.Dx !== ClipperBase.horizontal) break;
    while(E.Prev.Dx === ClipperBase.horizontal) E = E.Prev;
    E2 = E;
    while(E.Dx === ClipperBase.horizontal) E = E.Next;
    if(E.Top.y === E.Prev.Bot.y) continue;
    //ie just an intermediate horz.
    if(E2.Prev.Bot.x < E.Bot.x) E = E2;
    break;
  }
  return E;
};

ClipperBase.prototype.ProcessBound = function(E, LeftBoundIsForward) {
  var EStart;
  var Result = E;
  var Horz;

  if(Result.OutIdx === ClipperBase.Skip) {
    //check if there are edges beyond the skip edge in the bound and if so
    //create another LocMin and calling ProcessBound once more ...
    E = Result;
    if(LeftBoundIsForward) {
      while(E.Top.y === E.Next.Bot.y) E = E.Next;
      while(E !== Result && E.Dx === ClipperBase.horizontal) E = E.Prev;
    } else {
      while(E.Top.y === E.Prev.Bot.y) E = E.Prev;
      while(E !== Result && E.Dx === ClipperBase.horizontal) E = E.Next;
    }
    if(E === Result) {
      if(LeftBoundIsForward) Result = E.Next;
      else Result = E.Prev;
    } else {
      //there are more edges in the bound beyond result starting with E
      if(LeftBoundIsForward) E = Result.Next;
      else E = Result.Prev;
      var locMin = new LocalMinima();
      locMin.Next = null;
      locMin.y = E.Bot.y;
      locMin.LeftBound = null;
      locMin.RightBound = E;
      E.WindDelta = 0;
      Result = this.ProcessBound(E, LeftBoundIsForward);
      this.InsertLocalMinima(locMin);
    }
    return Result;
  }

  if(E.Dx === ClipperBase.horizontal) {
    //We need to be careful with open paths because this may not be a
    //true local minima (ie E may be following a skip edge).
    //Also, consecutive horz. edges may start heading left before going right.
    if(LeftBoundIsForward) EStart = E.Prev;
    else EStart = E.Next;

    if(EStart.Dx === ClipperBase.horizontal) {
      //ie an adjoining horizontal skip edge
      if(EStart.Bot.x !== E.Bot.x && EStart.Top.x !== E.Bot.x) this.ReverseHorizontal(E);
    } else if(EStart.Bot.x !== E.Bot.x) this.ReverseHorizontal(E);
  }

  EStart = E;
  if(LeftBoundIsForward) {
    while(Result.Top.y === Result.Next.Bot.y && Result.Next.OutIdx !== ClipperBase.Skip)
      Result = Result.Next;
    if(Result.Dx === ClipperBase.horizontal && Result.Next.OutIdx !== ClipperBase.Skip) {
      //nb: at the top of a bound, horizontals are added to the bound
      //only when the preceding edge attaches to the horizontal's left vertex
      //unless a Skip edge is encountered when that becomes the top divide
      Horz = Result;
      while(Horz.Prev.Dx === ClipperBase.horizontal) Horz = Horz.Prev;
      if(Horz.Prev.Top.x > Result.Next.Top.x) Result = Horz.Prev;
    }
    while(E !== Result) {
      E.NextInLML = E.Next;
      if(E.Dx === ClipperBase.horizontal && E !== EStart && E.Bot.x !== E.Prev.Top.x)
        this.ReverseHorizontal(E);
      E = E.Next;
    }
    if(E.Dx === ClipperBase.horizontal && E !== EStart && E.Bot.x !== E.Prev.Top.x)
      this.ReverseHorizontal(E);
    Result = Result.Next;
    //move to the edge just beyond current bound
  } else {
    while(Result.Top.y === Result.Prev.Bot.y && Result.Prev.OutIdx !== ClipperBase.Skip)
      Result = Result.Prev;
    if(Result.Dx === ClipperBase.horizontal && Result.Prev.OutIdx !== ClipperBase.Skip) {
      Horz = Result;
      while(Horz.Next.Dx === ClipperBase.horizontal) Horz = Horz.Next;
      if(Horz.Next.Top.x === Result.Prev.Top.x || Horz.Next.Top.x > Result.Prev.Top.x) {
        Result = Horz.Next;
      }
    }
    while(E !== Result) {
      E.NextInLML = E.Prev;
      if(E.Dx === ClipperBase.horizontal && E !== EStart && E.Bot.x !== E.Next.Top.x)
        this.ReverseHorizontal(E);
      E = E.Prev;
    }
    if(E.Dx === ClipperBase.horizontal && E !== EStart && E.Bot.x !== E.Next.Top.x)
      this.ReverseHorizontal(E);
    Result = Result.Prev;
    //move to the edge just beyond current bound
  }

  return Result;
};

ClipperBase.prototype.AddPath = function(pg, polyType, Closed) {
  if(use_lines) {
    if(!Closed && polyType === PolyType.ptClip) ClipperLib.Error('AddPath: Open paths must be subject.');
  } else {
    if(!Closed) ClipperLib.Error('AddPath: Open paths have been disabled.');
  }
  var highI = pg.length - 1;
  if(Closed) while(highI > 0 && FPoint.op_Equality(pg[highI], pg[0])) --highI;
  while(highI > 0 && FPoint.op_Equality(pg[highI], pg[highI - 1])) --highI;
  if((Closed && highI < 2) || (!Closed && highI < 1)) return false;
  //create a new edge array ...
  var edges = new Array();
  for(var i = 0; i <= highI; i++) edges.push(new TEdge());
  var IsFlat = true;
  //1. Basic (first) edge initialization ...

  //edges[1].Curr = pg[1];
  edges[1].Curr.x = pg[1].x;
  edges[1].Curr.y = pg[1].y;
  if(use_xyz) edges[1].Curr.z = pg[1].z;

  this.RangeTest(pg[0]);

  this.RangeTest(pg[highI]);

  this.InitEdge(edges[0], edges[1], edges[highI], pg[0]);
  this.InitEdge(edges[highI], edges[0], edges[highI - 1], pg[highI]);
  for(var i = highI - 1; i >= 1; --i) {
    this.RangeTest(pg[i]);

    this.InitEdge(edges[i], edges[i + 1], edges[i - 1], pg[i]);
  }

  var eStart = edges[0];
  //2. Remove duplicate vertices, and (when closed) collinear edges ...
  var E = eStart,
    eLoopStop = eStart;
  for(;;) {
    //console.log(E.Next, eStart);
    //nb: allows matching start and end points when not Closed ...
    if(E.Curr === E.Next.Curr && (Closed || E.Next !== eStart)) {
      if(E === E.Next) break;
      if(E === eStart) eStart = E.Next;
      E = this.RemoveEdge(E);
      eLoopStop = E;
      continue;
    }
    if(E.Prev === E.Next) break;
    else if(
      Closed &&
      ClipperBase.SlopesEqual4(E.Prev.Curr, E.Curr, E.Next.Curr) &&
      (!this.PreserveCollinear || !this.Pt2IsBetweenPt1AndPt3(E.Prev.Curr, E.Curr, E.Next.Curr))
    ) {
      //Collinear edges are allowed for open paths but in closed paths
      //the default is to merge adjacent collinear edges into a single edge.
      //However, if the PreserveCollinear property is enabled, only overlapping
      //collinear edges (ie spikes) will be removed from closed paths.
      if(E === eStart) eStart = E.Next;
      E = this.RemoveEdge(E);
      E = E.Prev;
      eLoopStop = E;
      continue;
    }
    E = E.Next;
    if(E === eLoopStop || (!Closed && E.Next === eStart)) break;
  }
  if((!Closed && E === E.Next) || (Closed && E.Prev === E.Next)) return false;
  if(!Closed) {
    this.m_HasOpenPaths = true;
    eStart.Prev.OutIdx = ClipperBase.Skip;
  }
  //3. Do second stage of edge initialization ...
  E = eStart;
  do {
    this.InitEdge2(E, polyType);
    E = E.Next;
    if(IsFlat && E.Curr.y !== eStart.Curr.y) IsFlat = false;
  } while(E !== eStart);
  //4. Finally, add edge bounds to LocalMinima list ...
  //Totally flat paths must be handled differently when adding them
  //to LocalMinima list to avoid endless loops etc ...
  if(IsFlat) {
    if(Closed) return false;

    E.Prev.OutIdx = ClipperBase.Skip;

    var locMin = new LocalMinima();
    locMin.Next = null;
    locMin.y = E.Bot.y;
    locMin.LeftBound = null;
    locMin.RightBound = E;
    locMin.RightBound.Side = EdgeSide.esRight;
    locMin.RightBound.WindDelta = 0;

    for(;;) {
      if(E.Bot.x !== E.Prev.Top.x) this.ReverseHorizontal(E);
      if(E.Next.OutIdx === ClipperBase.Skip) break;
      E.NextInLML = E.Next;
      E = E.Next;
    }
    this.InsertLocalMinima(locMin);
    this.m_edges.push(edges);
    return true;
  }
  this.m_edges.push(edges);
  var leftBoundIsForward;
  var EMin = null;

  //workaround to avoid an endless loop in the while loop below when
  //open paths have matching start and end points ...
  if(FPoint.op_Equality(E.Prev.Bot, E.Prev.Top)) E = E.Next;

  for(;;) {
    E = this.FindNextLocMin(E);
    if(E === EMin) break;
    else if(EMin === null) EMin = E;
    //E and E.Prev now share a local minima (left aligned if horizontal).
    //Compare their slopes to find which starts which bound ...
    var locMin = new LocalMinima();
    locMin.Next = null;
    locMin.y = E.Bot.y;
    if(E.Dx < E.Prev.Dx) {
      locMin.LeftBound = E.Prev;
      locMin.RightBound = E;
      leftBoundIsForward = false;
      //Q.nextInLML = Q.prev
    } else {
      locMin.LeftBound = E;
      locMin.RightBound = E.Prev;
      leftBoundIsForward = true;
      //Q.nextInLML = Q.next
    }
    locMin.LeftBound.Side = EdgeSide.esLeft;
    locMin.RightBound.Side = EdgeSide.esRight;
    if(!Closed) locMin.LeftBound.WindDelta = 0;
    else if(locMin.LeftBound.Next === locMin.RightBound) locMin.LeftBound.WindDelta = -1;
    else locMin.LeftBound.WindDelta = 1;
    locMin.RightBound.WindDelta = -locMin.LeftBound.WindDelta;
    E = this.ProcessBound(locMin.LeftBound, leftBoundIsForward);
    if(E.OutIdx === ClipperBase.Skip) E = this.ProcessBound(E, leftBoundIsForward);
    var E2 = this.ProcessBound(locMin.RightBound, !leftBoundIsForward);
    if(E2.OutIdx === ClipperBase.Skip) E2 = this.ProcessBound(E2, !leftBoundIsForward);
    if(locMin.LeftBound.OutIdx === ClipperBase.Skip) locMin.LeftBound = null;
    else if(locMin.RightBound.OutIdx === ClipperBase.Skip) locMin.RightBound = null;
    this.InsertLocalMinima(locMin);
    if(!leftBoundIsForward) E = E2;
  }
  return true;
};

ClipperBase.prototype.AddPaths = function(ppg, polyType, closed) {
  //  console.log("-------------------------------------------");
  //  console.log(JSON.stringify(ppg));
  var result = false;
  for(var i = 0, ilen = ppg.length; i < ilen; ++i)
    if(this.AddPath(ppg[i], polyType, closed)) result = true;
  return result;
};

ClipperBase.prototype.Pt2IsBetweenPt1AndPt3 = function(pt1, pt2, pt3) {
  if(FPoint.op_Equality(pt1, pt3) || FPoint.op_Equality(pt1, pt2) || FPoint.op_Equality(pt3, pt2))
    //if ((pt1 == pt3) || (pt1 == pt2) || (pt3 == pt2))
    return false;
  else if(pt1.x !== pt3.x) return pt2.x > pt1.x === pt2.x < pt3.x;
  else return pt2.y > pt1.y === pt2.y < pt3.y;
};

ClipperBase.prototype.RemoveEdge = function(e) {
  //removes e from double_linked_list (but without removing from memory)
  e.Prev.Next = e.Next;
  e.Next.Prev = e.Prev;
  var result = e.Next;
  e.Prev = null; //flag as removed (see ClipperBase.Clear)
  return result;
};

ClipperBase.prototype.SetDx = function(e) {
  e.Delta.x = e.Top.x - e.Bot.x;
  e.Delta.y = e.Top.y - e.Bot.y;
  if(e.Delta.y === 0) e.Dx = ClipperBase.horizontal;
  else e.Dx = e.Delta.x / e.Delta.y;
};

ClipperBase.prototype.InsertLocalMinima = function(newLm) {
  if(this.m_MinimaList === null) {
    this.m_MinimaList = newLm;
  } else if(newLm.y >= this.m_MinimaList.y) {
    newLm.Next = this.m_MinimaList;
    this.m_MinimaList = newLm;
  } else {
    var tmpLm = this.m_MinimaList;
    while(tmpLm.Next !== null && newLm.y < tmpLm.Next.y) tmpLm = tmpLm.Next;
    newLm.Next = tmpLm.Next;
    tmpLm.Next = newLm;
  }
};

ClipperBase.prototype.PopLocalMinima = function(y, current) {
  current.v = this.m_CurrentLM;
  if(this.m_CurrentLM !== null && this.m_CurrentLM.y === y) {
    this.m_CurrentLM = this.m_CurrentLM.Next;
    return true;
  }
  return false;
};

ClipperBase.prototype.ReverseHorizontal = function(e) {
  //swap horizontal edges' top and bottom x's so they follow the natural
  //progression of the bounds - ie so their xbots will align with the
  //adjoining lower edge. [Helpful in the ProcessHorizontal() method.]
  var tmp = e.Top.x;
  e.Top.x = e.Bot.x;
  e.Bot.x = tmp;
  if(use_xyz) {
    tmp = e.Top.z;
    e.Top.z = e.Bot.z;
    e.Bot.z = tmp;
  }
};

ClipperBase.prototype.Reset = function() {
  this.m_CurrentLM = this.m_MinimaList;
  if(this.m_CurrentLM === null)
    //ie nothing to process
    return;
  //reset all edges ...
  this.m_Scanbeam = null;
  var lm = this.m_MinimaList;
  while(lm !== null) {
    this.InsertScanbeam(lm.y);
    var e = lm.LeftBound;
    if(e !== null) {
      //e.Curr = e.Bot;
      e.Curr.x = e.Bot.x;
      e.Curr.y = e.Bot.y;
      if(use_xyz) e.Curr.z = e.Bot.z;
      e.OutIdx = ClipperBase.Unassigned;
    }
    e = lm.RightBound;
    if(e !== null) {
      //e.Curr = e.Bot;
      e.Curr.x = e.Bot.x;
      e.Curr.y = e.Bot.y;
      if(use_xyz) e.Curr.z = e.Bot.z;
      e.OutIdx = ClipperBase.Unassigned;
    }
    lm = lm.Next;
  }
  this.m_ActiveEdges = null;
};

ClipperBase.prototype.InsertScanbeam = function(y) {
  //single-linked list: sorted descending, ignoring dups.
  if(this.m_Scanbeam === null) {
    this.m_Scanbeam = new Scanbeam();
    this.m_Scanbeam.Next = null;
    this.m_Scanbeam.y = y;
  } else if(y > this.m_Scanbeam.y) {
    var newSb = new Scanbeam();
    newSb.y = y;
    newSb.Next = this.m_Scanbeam;
    this.m_Scanbeam = newSb;
  } else {
    var sb2 = this.m_Scanbeam;
    while(sb2.Next !== null && y <= sb2.Next.y) {
      sb2 = sb2.Next;
    }
    if(y === sb2.y) {
      return;
    } //ie ignores duplicates
    var newSb1 = new Scanbeam();
    newSb1.y = y;
    newSb1.Next = sb2.Next;
    sb2.Next = newSb1;
  }
};

ClipperBase.prototype.PopScanbeam = function(y) {
  if(this.m_Scanbeam === null) {
    y.v = 0;
    return false;
  }
  y.v = this.m_Scanbeam.y;
  this.m_Scanbeam = this.m_Scanbeam.Next;
  return true;
};

ClipperBase.prototype.LocalMinimaPending = function() {
  return this.m_CurrentLM !== null;
};

ClipperBase.prototype.CreateOutRec = function() {
  var result = new OutRec();
  result.Idx = ClipperBase.Unassigned;
  result.IsHole = false;
  result.IsOpen = false;
  result.FirstLeft = null;
  result.Pts = null;
  result.BottomPt = null;
  result.PolyNode = null;
  this.m_PolyOuts.push(result);
  result.Idx = this.m_PolyOuts.length - 1;
  return result;
};

ClipperBase.prototype.DisposeOutRec = function(index) {
  var outRec = this.m_PolyOuts[index];
  outRec.Pts = null;
  outRec = null;
  this.m_PolyOuts[index] = null;
};

ClipperBase.prototype.UpdateEdgeIntoAEL = function(e) {
  if(e.NextInLML === null) {
    ClipperLib.Error('UpdateEdgeIntoAEL: invalid call');
  }
  var AelPrev = e.PrevInAEL;
  var AelNext = e.NextInAEL;
  e.NextInLML.OutIdx = e.OutIdx;
  if(AelPrev !== null) {
    AelPrev.NextInAEL = e.NextInLML;
  } else {
    this.m_ActiveEdges = e.NextInLML;
  }
  if(AelNext !== null) {
    AelNext.PrevInAEL = e.NextInLML;
  }
  e.NextInLML.Side = e.Side;
  e.NextInLML.WindDelta = e.WindDelta;
  e.NextInLML.WindCnt = e.WindCnt;
  e.NextInLML.WindCnt2 = e.WindCnt2;
  e = e.NextInLML;
  e.Curr.x = e.Bot.x;
  e.Curr.y = e.Bot.y;
  e.PrevInAEL = AelPrev;
  e.NextInAEL = AelNext;
  if(!ClipperBase.IsHorizontal(e)) {
    this.InsertScanbeam(e.Top.y);
  }
  return e;
};

ClipperBase.prototype.SwapPositionsInAEL = function(edge1, edge2) {
  //check that one or other edge hasn't already been removed from AEL ...
  if(edge1.NextInAEL === edge1.PrevInAEL || edge2.NextInAEL === edge2.PrevInAEL) {
    return;
  }

  if(edge1.NextInAEL === edge2) {
    var next = edge2.NextInAEL;
    if(next !== null) {
      next.PrevInAEL = edge1;
    }
    var prev = edge1.PrevInAEL;
    if(prev !== null) {
      prev.NextInAEL = edge2;
    }
    edge2.PrevInAEL = prev;
    edge2.NextInAEL = edge1;
    edge1.PrevInAEL = edge2;
    edge1.NextInAEL = next;
  } else if(edge2.NextInAEL === edge1) {
    var next1 = edge1.NextInAEL;
    if(next1 !== null) {
      next1.PrevInAEL = edge2;
    }
    var prev1 = edge2.PrevInAEL;
    if(prev1 !== null) {
      prev1.NextInAEL = edge1;
    }
    edge1.PrevInAEL = prev1;
    edge1.NextInAEL = edge2;
    edge2.PrevInAEL = edge1;
    edge2.NextInAEL = next1;
  } else {
    var next2 = edge1.NextInAEL;
    var prev2 = edge1.PrevInAEL;
    edge1.NextInAEL = edge2.NextInAEL;
    if(edge1.NextInAEL !== null) {
      edge1.NextInAEL.PrevInAEL = edge1;
    }
    edge1.PrevInAEL = edge2.PrevInAEL;
    if(edge1.PrevInAEL !== null) {
      edge1.PrevInAEL.NextInAEL = edge1;
    }
    edge2.NextInAEL = next2;
    if(edge2.NextInAEL !== null) {
      edge2.NextInAEL.PrevInAEL = edge2;
    }
    edge2.PrevInAEL = prev2;
    if(edge2.PrevInAEL !== null) {
      edge2.PrevInAEL.NextInAEL = edge2;
    }
  }

  if(edge1.PrevInAEL === null) {
    this.m_ActiveEdges = edge1;
  } else {
    if(edge2.PrevInAEL === null) {
      this.m_ActiveEdges = edge2;
    }
  }
};

ClipperBase.prototype.DeleteFromAEL = function(e) {
  var AelPrev = e.PrevInAEL;
  var AelNext = e.NextInAEL;
  if(AelPrev === null && AelNext === null && e !== this.m_ActiveEdges) {
    return;
  } //already deleted
  if(AelPrev !== null) {
    AelPrev.NextInAEL = AelNext;
  } else {
    this.m_ActiveEdges = AelNext;
  }
  if(AelNext !== null) {
    AelNext.PrevInAEL = AelPrev;
  }
  e.NextInAEL = null;
  e.PrevInAEL = null;
};

// public Clipper(int InitOptions = 0)
/**
 * @suppress {missingProperties}
 */
export const Clipper = (ClipperLib.Clipper = function(InitOptions) {
  if(typeof InitOptions === 'undefined') InitOptions = 0;
  this.m_PolyOuts = null;
  this.m_ClipType = ClipType.ctIntersection;
  this.m_Scanbeam = null;
  this.m_Maxima = null;
  this.m_ActiveEdges = null;
  this.m_SortedEdges = null;
  this.m_IntersectList = null;
  this.m_IntersectNodeComparer = null;
  this.m_ExecuteLocked = false;
  this.m_ClipFillType = PolyFillType.pftEvenOdd;
  this.m_SubjFillType = PolyFillType.pftEvenOdd;
  this.m_Joins = null;
  this.m_GhostJoins = null;
  this.m_UsingPolyTree = false;
  this.ReverseSolution = false;
  this.StrictlySimple = false;

  ClipperBase.call(this);

  this.m_Scanbeam = null;
  this.m_Maxima = null;
  this.m_ActiveEdges = null;
  this.m_SortedEdges = null;
  this.m_IntersectList = new Array();
  this.m_IntersectNodeComparer = MyIntersectNodeSort.Compare;
  this.m_ExecuteLocked = false;
  this.m_UsingPolyTree = false;
  this.m_PolyOuts = new Array();
  this.m_Joins = new Array();
  this.m_GhostJoins = new Array();
  this.ReverseSolution = (1 & InitOptions) !== 0;
  this.StrictlySimple = (2 & InitOptions) !== 0;
  this.PreserveCollinear = (4 & InitOptions) !== 0;
  if(use_xyz) {
    this.ZFillFunction = null; // function (FPoint bot1, FPoint top1, FPoint bot2, FPoint top2, ref FPoint intersectPt);
  }
});

Clipper.ioReverseSolution = 1;
Clipper.ioStrictlySimple = 2;
Clipper.ioPreserveCollinear = 4;

Clipper.prototype.Clear = function() {
  if(this.m_edges.length === 0) return;
  //avoids problems with ClipperBase destructor
  this.DisposeAllPolyPts();
  ClipperBase.prototype.Clear.call(this);
};

Clipper.prototype.InsertMaxima = function(x) {
  //double-linked list: sorted ascending, ignoring dups.
  var newMax = new Maxima();
  newMax.x = x;
  if(this.m_Maxima === null) {
    this.m_Maxima = newMax;
    this.m_Maxima.Next = null;
    this.m_Maxima.Prev = null;
  } else if(x < this.m_Maxima.x) {
    newMax.Next = this.m_Maxima;
    newMax.Prev = null;
    this.m_Maxima = newMax;
  } else {
    var m = this.m_Maxima;
    while(m.Next !== null && x >= m.Next.x) {
      m = m.Next;
    }
    if(x === m.x) {
      return;
    } //ie ignores duplicates (& CG to clean up newMax)
    //insert newMax between m and m.Next ...
    newMax.Next = m.Next;
    newMax.Prev = m;
    if(m.Next !== null) {
      m.Next.Prev = newMax;
    }
    m.Next = newMax;
  }
};

// ************************************
Clipper.prototype.Execute = function() {
  var a = arguments,
    alen = a.length,
    ispolytree = a[1] instanceof PolyTree;
  if(alen === 4 && !ispolytree) {
    // function (clipType, solution, subjFillType, clipFillType)
    var clipType = a[0],
      solution = a[1],
      subjFillType = a[2],
      clipFillType = a[3];
    if(this.m_ExecuteLocked) return false;
    if(this.m_HasOpenPaths) ClipperLib.Error('Error: PolyTree struct is needed for open path clipping.');
    this.m_ExecuteLocked = true;
    Clear(solution);
    this.m_SubjFillType = subjFillType;
    this.m_ClipFillType = clipFillType;
    this.m_ClipType = clipType;
    this.m_UsingPolyTree = false;
    try {
      var succeeded = this.ExecuteInternal();
      //build the return polygons ...
      if(succeeded) this.BuildResult(solution);
    } finally {
      this.DisposeAllPolyPts();
      this.m_ExecuteLocked = false;
    }
    return succeeded;
  } else if(alen === 4 && ispolytree) {
    // function (clipType, polytree, subjFillType, clipFillType)
    var clipType = a[0],
      polytree = a[1],
      subjFillType = a[2],
      clipFillType = a[3];
    if(this.m_ExecuteLocked) return false;
    this.m_ExecuteLocked = true;
    this.m_SubjFillType = subjFillType;
    this.m_ClipFillType = clipFillType;
    this.m_ClipType = clipType;
    this.m_UsingPolyTree = true;
    try {
      var succeeded = this.ExecuteInternal();
      //build the return polygons ...
      if(succeeded) this.BuildResult2(polytree);
    } finally {
      this.DisposeAllPolyPts();
      this.m_ExecuteLocked = false;
    }
    return succeeded;
  } else if(alen === 2 && !ispolytree) {
    // function (clipType, solution)
    var clipType = a[0],
      solution = a[1];
    return this.Execute(clipType, solution, PolyFillType.pftEvenOdd, PolyFillType.pftEvenOdd);
  } else if(alen === 2 && ispolytree) {
    // function (clipType, polytree)
    var clipType = a[0],
      polytree = a[1];
    return this.Execute(clipType, polytree, PolyFillType.pftEvenOdd, PolyFillType.pftEvenOdd);
  }
};

Clipper.prototype.FixHoleLinkage = function(outRec) {
  //skip if an outermost polygon or
  //already already points to the correct FirstLeft ...
  if(
    outRec.FirstLeft === null ||
    (outRec.IsHole !== outRec.FirstLeft.IsHole && outRec.FirstLeft.Pts !== null)
  )
    return;
  var orfl = outRec.FirstLeft;
  while(orfl !== null && (orfl.IsHole === outRec.IsHole || orfl.Pts === null))
    orfl = orfl.FirstLeft;
  outRec.FirstLeft = orfl;
};

Clipper.prototype.ExecuteInternal = function() {
  try {
    this.Reset();
    this.m_SortedEdges = null;
    this.m_Maxima = null;

    var botY = {},
      topY = {};

    if(!this.PopScanbeam(botY)) {
      return false;
    }
    this.InsertLocalMinimaIntoAEL(botY.v);
    while(this.PopScanbeam(topY) || this.LocalMinimaPending()) {
      this.ProcessHorizontals();
      this.m_GhostJoins.length = 0;
      if(!this.ProcessIntersections(topY.v)) {
        return false;
      }
      this.ProcessEdgesAtTopOfScanbeam(topY.v);
      botY.v = topY.v;
      this.InsertLocalMinimaIntoAEL(botY.v);
    }

    //fix orientations ...
    var outRec, i, ilen;
    //fix orientations ...
    for(i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++) {
      outRec = this.m_PolyOuts[i];
      if(outRec.Pts === null || outRec.IsOpen) continue;
      if((outRec.IsHole ^ this.ReverseSolution) == this.Area$1(outRec) > 0)
        this.ReversePolyPtLinks(outRec.Pts);
    }

    this.JoinCommonEdges();

    for(i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++) {
      outRec = this.m_PolyOuts[i];
      if(outRec.Pts === null) continue;
      else if(outRec.IsOpen) this.FixupOutPolyline(outRec);
      else this.FixupOutPolygon(outRec);
    }

    if(this.StrictlySimple) this.DoSimplePolygons();
    return true;
  } finally {
    //catch { return false; }
    this.m_Joins.length = 0;
    this.m_GhostJoins.length = 0;
  }
};

Clipper.prototype.DisposeAllPolyPts = function() {
  for(var i = 0, ilen = this.m_PolyOuts.length; i < ilen; ++i) this.DisposeOutRec(i);
  Clear(this.m_PolyOuts);
};

Clipper.prototype.AddJoin = function(Op1, Op2, OffPt) {
  var j = new Join();
  j.OutPt1 = Op1;
  j.OutPt2 = Op2;
  //j.OffPt = OffPt;
  j.OffPt.x = OffPt.x;
  j.OffPt.y = OffPt.y;
  if(use_xyz) j.OffPt.z = OffPt.z;
  this.m_Joins.push(j);
};

Clipper.prototype.AddGhostJoin = function(Op, OffPt) {
  var j = new Join();
  j.OutPt1 = Op;
  //j.OffPt = OffPt;
  j.OffPt.x = OffPt.x;
  j.OffPt.y = OffPt.y;
  if(use_xyz) j.OffPt.z = OffPt.z;
  this.m_GhostJoins.push(j);
};

//if (use_xyz)
//{
Clipper.prototype.SetZ = function(pt, e1, e2) {
  if(this.ZFillFunction !== null) {
    if(pt.z !== 0 || this.ZFillFunction === null) return;
    else if(FPoint.op_Equality(pt, e1.Bot)) pt.z = e1.Bot.z;
    else if(FPoint.op_Equality(pt, e1.Top)) pt.z = e1.Top.z;
    else if(FPoint.op_Equality(pt, e2.Bot)) pt.z = e2.Bot.z;
    else if(FPoint.op_Equality(pt, e2.Top)) pt.z = e2.Top.z;
    else this.ZFillFunction(e1.Bot, e1.Top, e2.Bot, e2.Top, pt);
  }
};
//}

Clipper.prototype.InsertLocalMinimaIntoAEL = function(botY) {
  var lm = {};

  var lb;
  var rb;
  while(this.PopLocalMinima(botY, lm)) {
    lb = lm.v.LeftBound;
    rb = lm.v.RightBound;

    var Op1 = null;
    if(lb === null) {
      this.InsertEdgeIntoAEL(rb, null);
      this.SetWindingCount(rb);
      if(this.IsContributing(rb)) Op1 = this.AddOutPt(rb, rb.Bot);
    } else if(rb === null) {
      this.InsertEdgeIntoAEL(lb, null);
      this.SetWindingCount(lb);
      if(this.IsContributing(lb)) Op1 = this.AddOutPt(lb, lb.Bot);
      this.InsertScanbeam(lb.Top.y);
    } else {
      this.InsertEdgeIntoAEL(lb, null);
      this.InsertEdgeIntoAEL(rb, lb);
      this.SetWindingCount(lb);
      rb.WindCnt = lb.WindCnt;
      rb.WindCnt2 = lb.WindCnt2;
      if(this.IsContributing(lb)) Op1 = this.AddLocalMinPoly(lb, rb, lb.Bot);
      this.InsertScanbeam(lb.Top.y);
    }
    if(rb !== null) {
      if(ClipperBase.IsHorizontal(rb)) {
        if(rb.NextInLML !== null) {
          this.InsertScanbeam(rb.NextInLML.Top.y);
        }
        this.AddEdgeToSEL(rb);
      } else {
        this.InsertScanbeam(rb.Top.y);
      }
    }
    if(lb === null || rb === null) continue;
    //if output polygons share an Edge with a horizontal rb, they'll need joining later ...
    if(
      Op1 !== null &&
      ClipperBase.IsHorizontal(rb) &&
      this.m_GhostJoins.length > 0 &&
      rb.WindDelta !== 0
    ) {
      for(var i = 0, ilen = this.m_GhostJoins.length; i < ilen; i++) {
        //if the horizontal Rb and a 'ghost' horizontal overlap, then convert
        //the 'ghost' join to a real join ready for later ...
        var j = this.m_GhostJoins[i];

        if(this.HorzSegmentsOverlap(j.OutPt1.Pt.x, j.OffPt.x, rb.Bot.x, rb.Top.x))
          this.AddJoin(j.OutPt1, Op1, j.OffPt);
      }
    }

    if(
      lb.OutIdx >= 0 &&
      lb.PrevInAEL !== null &&
      lb.PrevInAEL.Curr.x === lb.Bot.x &&
      lb.PrevInAEL.OutIdx >= 0 &&
      ClipperBase.SlopesEqual5(lb.PrevInAEL.Curr, lb.PrevInAEL.Top, lb.Curr, lb.Top) &&
      lb.WindDelta !== 0 &&
      lb.PrevInAEL.WindDelta !== 0
    ) {
      var Op2 = this.AddOutPt(lb.PrevInAEL, lb.Bot);
      this.AddJoin(Op1, Op2, lb.Top);
    }
    if(lb.NextInAEL !== rb) {
      if(
        rb.OutIdx >= 0 &&
        rb.PrevInAEL.OutIdx >= 0 &&
        ClipperBase.SlopesEqual5(rb.PrevInAEL.Curr, rb.PrevInAEL.Top, rb.Curr, rb.Top) &&
        rb.WindDelta !== 0 &&
        rb.PrevInAEL.WindDelta !== 0
      ) {
        var Op2 = this.AddOutPt(rb.PrevInAEL, rb.Bot);
        this.AddJoin(Op1, Op2, rb.Top);
      }
      var e = lb.NextInAEL;
      if(e !== null)
        while(e !== rb) {
          //nb: For calculating winding counts etc, IntersectEdges() assumes
          //that param1 will be to the right of param2 ABOVE the intersection ...
          this.IntersectEdges(rb, e, lb.Curr);
          //order important here
          e = e.NextInAEL;
        }
    }
  }
};

Clipper.prototype.InsertEdgeIntoAEL = function(edge, startEdge) {
  if(this.m_ActiveEdges === null) {
    edge.PrevInAEL = null;
    edge.NextInAEL = null;
    this.m_ActiveEdges = edge;
  } else if(startEdge === null && this.E2InsertsBeforeE1(this.m_ActiveEdges, edge)) {
    edge.PrevInAEL = null;
    edge.NextInAEL = this.m_ActiveEdges;
    this.m_ActiveEdges.PrevInAEL = edge;
    this.m_ActiveEdges = edge;
  } else {
    if(startEdge === null) startEdge = this.m_ActiveEdges;
    while(startEdge.NextInAEL !== null && !this.E2InsertsBeforeE1(startEdge.NextInAEL, edge))
      startEdge = startEdge.NextInAEL;
    edge.NextInAEL = startEdge.NextInAEL;
    if(startEdge.NextInAEL !== null) startEdge.NextInAEL.PrevInAEL = edge;
    edge.PrevInAEL = startEdge;
    startEdge.NextInAEL = edge;
  }
};

Clipper.prototype.E2InsertsBeforeE1 = function(e1, e2) {
  if(e2.Curr.x === e1.Curr.x) {
    if(e2.Top.y > e1.Top.y) return e2.Top.x < Clipper.TopX(e1, e2.Top.y);
    else return e1.Top.x > Clipper.TopX(e2, e1.Top.y);
  } else return e2.Curr.x < e1.Curr.x;
};

Clipper.prototype.IsEvenOddFillType = function(edge) {
  if(edge.PolyTyp === PolyType.ptSubject) return this.m_SubjFillType === PolyFillType.pftEvenOdd;
  else return this.m_ClipFillType === PolyFillType.pftEvenOdd;
};

Clipper.prototype.IsEvenOddAltFillType = function(edge) {
  if(edge.PolyTyp === PolyType.ptSubject) return this.m_ClipFillType === PolyFillType.pftEvenOdd;
  else return this.m_SubjFillType === PolyFillType.pftEvenOdd;
};

Clipper.prototype.IsContributing = function(edge) {
  var pft, pft2;
  if(edge.PolyTyp === PolyType.ptSubject) {
    pft = this.m_SubjFillType;
    pft2 = this.m_ClipFillType;
  } else {
    pft = this.m_ClipFillType;
    pft2 = this.m_SubjFillType;
  }
  switch (pft) {
    case PolyFillType.pftEvenOdd:
      if(edge.WindDelta === 0 && edge.WindCnt !== 1) return false;
      break;
    case PolyFillType.pftNonZero:
      if(Math.abs(edge.WindCnt) !== 1) return false;
      break;
    case PolyFillType.pftPositive:
      if(edge.WindCnt !== 1) return false;
      break;
    default:
      if(edge.WindCnt !== -1) return false;
      break;
  }
  switch (this.m_ClipType) {
    case ClipType.ctIntersection:
      switch (pft2) {
        case PolyFillType.pftEvenOdd:
        case PolyFillType.pftNonZero:
          return edge.WindCnt2 !== 0;
        case PolyFillType.pftPositive:
          return edge.WindCnt2 > 0;
        default:
          return edge.WindCnt2 < 0;
      }
    case ClipType.ctUnion:
      switch (pft2) {
        case PolyFillType.pftEvenOdd:
        case PolyFillType.pftNonZero:
          return edge.WindCnt2 === 0;
        case PolyFillType.pftPositive:
          return edge.WindCnt2 <= 0;
        default:
          return edge.WindCnt2 >= 0;
      }
    case ClipType.ctDifference:
      if(edge.PolyTyp === PolyType.ptSubject)
        switch (pft2) {
          case PolyFillType.pftEvenOdd:
          case PolyFillType.pftNonZero:
            return edge.WindCnt2 === 0;
          case PolyFillType.pftPositive:
            return edge.WindCnt2 <= 0;
          default:
            return edge.WindCnt2 >= 0;
        }
      else
        switch (pft2) {
          case PolyFillType.pftEvenOdd:
          case PolyFillType.pftNonZero:
            return edge.WindCnt2 !== 0;
          case PolyFillType.pftPositive:
            return edge.WindCnt2 > 0;
          default:
            return edge.WindCnt2 < 0;
        }
    case ClipType.ctXor:
      if(edge.WindDelta === 0)
        switch (pft2) {
          case PolyFillType.pftEvenOdd:
          case PolyFillType.pftNonZero:
            return edge.WindCnt2 === 0;
          case PolyFillType.pftPositive:
            return edge.WindCnt2 <= 0;
          default:
            return edge.WindCnt2 >= 0;
        }
      else return true;
  }
  return true;
};

Clipper.prototype.SetWindingCount = function(edge) {
  var e = edge.PrevInAEL;
  //find the edge of the same polytype that immediately preceeds 'edge' in AEL
  while(e !== null && (e.PolyTyp !== edge.PolyTyp || e.WindDelta === 0)) e = e.PrevInAEL;
  if(e === null) {
    var pft = edge.PolyTyp === PolyType.ptSubject ? this.m_SubjFillType : this.m_ClipFillType;
    if(edge.WindDelta === 0) {
      edge.WindCnt = pft === PolyFillType.pftNegative ? -1 : 1;
    } else {
      edge.WindCnt = edge.WindDelta;
    }
    edge.WindCnt2 = 0;
    e = this.m_ActiveEdges;
    //ie get ready to calc WindCnt2
  } else if(edge.WindDelta === 0 && this.m_ClipType !== ClipType.ctUnion) {
    edge.WindCnt = 1;
    edge.WindCnt2 = e.WindCnt2;
    e = e.NextInAEL;
    //ie get ready to calc WindCnt2
  } else if(this.IsEvenOddFillType(edge)) {
    //EvenOdd filling ...
    if(edge.WindDelta === 0) {
      //are we inside a subj polygon ...
      var Inside = true;
      var e2 = e.PrevInAEL;
      while(e2 !== null) {
        if(e2.PolyTyp === e.PolyTyp && e2.WindDelta !== 0) Inside = !Inside;
        e2 = e2.PrevInAEL;
      }
      edge.WindCnt = Inside ? 0 : 1;
    } else {
      edge.WindCnt = edge.WindDelta;
    }
    edge.WindCnt2 = e.WindCnt2;
    e = e.NextInAEL;
    //ie get ready to calc WindCnt2
  } else {
    //nonZero, Positive or Negative filling ...
    if(e.WindCnt * e.WindDelta < 0) {
      //prev edge is 'decreasing' WindCount (WC) toward zero
      //so we're outside the previous polygon ...
      if(Math.abs(e.WindCnt) > 1) {
        //outside prev poly but still inside another.
        //when reversing direction of prev poly use the same WC
        if(e.WindDelta * edge.WindDelta < 0) edge.WindCnt = e.WindCnt;
        else edge.WindCnt = e.WindCnt + edge.WindDelta;
      } else edge.WindCnt = edge.WindDelta === 0 ? 1 : edge.WindDelta;
    } else {
      //prev edge is 'increasing' WindCount (WC) away from zero
      //so we're inside the previous polygon ...
      if(edge.WindDelta === 0) edge.WindCnt = e.WindCnt < 0 ? e.WindCnt - 1 : e.WindCnt + 1;
      else if(e.WindDelta * edge.WindDelta < 0) edge.WindCnt = e.WindCnt;
      else edge.WindCnt = e.WindCnt + edge.WindDelta;
    }
    edge.WindCnt2 = e.WindCnt2;
    e = e.NextInAEL;
    //ie get ready to calc WindCnt2
  }
  //update WindCnt2 ...
  if(this.IsEvenOddAltFillType(edge)) {
    //EvenOdd filling ...
    while(e !== edge) {
      if(e.WindDelta !== 0) edge.WindCnt2 = edge.WindCnt2 === 0 ? 1 : 0;
      e = e.NextInAEL;
    }
  } else {
    //nonZero, Positive or Negative filling ...
    while(e !== edge) {
      edge.WindCnt2 += e.WindDelta;
      e = e.NextInAEL;
    }
  }
};

Clipper.prototype.AddEdgeToSEL = function(edge) {
  //SEL pointers in PEdge are use to build transient lists of horizontal edges.
  //However, since we don't need to worry about processing order, all additions
  //are made to the front of the list ...
  if(this.m_SortedEdges === null) {
    this.m_SortedEdges = edge;
    edge.PrevInSEL = null;
    edge.NextInSEL = null;
  } else {
    edge.NextInSEL = this.m_SortedEdges;
    edge.PrevInSEL = null;
    this.m_SortedEdges.PrevInSEL = edge;
    this.m_SortedEdges = edge;
  }
};

Clipper.prototype.PopEdgeFromSEL = function(e) {
  //Pop edge from front of SEL (ie SEL is a FILO list)
  e.v = this.m_SortedEdges;
  if(e.v === null) {
    return false;
  }
  var oldE = e.v;
  this.m_SortedEdges = e.v.NextInSEL;
  if(this.m_SortedEdges !== null) {
    this.m_SortedEdges.PrevInSEL = null;
  }
  oldE.NextInSEL = null;
  oldE.PrevInSEL = null;
  return true;
};

Clipper.prototype.CopyAELToSEL = function() {
  var e = this.m_ActiveEdges;
  this.m_SortedEdges = e;
  while(e !== null) {
    e.PrevInSEL = e.PrevInAEL;
    e.NextInSEL = e.NextInAEL;
    e = e.NextInAEL;
  }
};

Clipper.prototype.SwapPositionsInSEL = function(edge1, edge2) {
  if(edge1.NextInSEL === null && edge1.PrevInSEL === null) return;
  if(edge2.NextInSEL === null && edge2.PrevInSEL === null) return;
  if(edge1.NextInSEL === edge2) {
    var next = edge2.NextInSEL;
    if(next !== null) next.PrevInSEL = edge1;
    var prev = edge1.PrevInSEL;
    if(prev !== null) prev.NextInSEL = edge2;
    edge2.PrevInSEL = prev;
    edge2.NextInSEL = edge1;
    edge1.PrevInSEL = edge2;
    edge1.NextInSEL = next;
  } else if(edge2.NextInSEL === edge1) {
    var next = edge1.NextInSEL;
    if(next !== null) next.PrevInSEL = edge2;
    var prev = edge2.PrevInSEL;
    if(prev !== null) prev.NextInSEL = edge1;
    edge1.PrevInSEL = prev;
    edge1.NextInSEL = edge2;
    edge2.PrevInSEL = edge1;
    edge2.NextInSEL = next;
  } else {
    var next = edge1.NextInSEL;
    var prev = edge1.PrevInSEL;
    edge1.NextInSEL = edge2.NextInSEL;
    if(edge1.NextInSEL !== null) edge1.NextInSEL.PrevInSEL = edge1;
    edge1.PrevInSEL = edge2.PrevInSEL;
    if(edge1.PrevInSEL !== null) edge1.PrevInSEL.NextInSEL = edge1;
    edge2.NextInSEL = next;
    if(edge2.NextInSEL !== null) edge2.NextInSEL.PrevInSEL = edge2;
    edge2.PrevInSEL = prev;
    if(edge2.PrevInSEL !== null) edge2.PrevInSEL.NextInSEL = edge2;
  }
  if(edge1.PrevInSEL === null) this.m_SortedEdges = edge1;
  else if(edge2.PrevInSEL === null) this.m_SortedEdges = edge2;
};

Clipper.prototype.AddLocalMaxPoly = function(e1, e2, pt) {
  this.AddOutPt(e1, pt);
  if(e2.WindDelta === 0) this.AddOutPt(e2, pt);
  if(e1.OutIdx === e2.OutIdx) {
    e1.OutIdx = -1;
    e2.OutIdx = -1;
  } else if(e1.OutIdx < e2.OutIdx) this.AppendPolygon(e1, e2);
  else this.AppendPolygon(e2, e1);
};

Clipper.prototype.AddLocalMinPoly = function(e1, e2, pt) {
  var result;
  var e, prevE;
  if(ClipperBase.IsHorizontal(e2) || e1.Dx > e2.Dx) {
    result = this.AddOutPt(e1, pt);
    e2.OutIdx = e1.OutIdx;
    e1.Side = EdgeSide.esLeft;
    e2.Side = EdgeSide.esRight;
    e = e1;
    if(e.PrevInAEL === e2) prevE = e2.PrevInAEL;
    else prevE = e.PrevInAEL;
  } else {
    result = this.AddOutPt(e2, pt);
    e1.OutIdx = e2.OutIdx;
    e1.Side = EdgeSide.esRight;
    e2.Side = EdgeSide.esLeft;
    e = e2;
    if(e.PrevInAEL === e1) prevE = e1.PrevInAEL;
    else prevE = e.PrevInAEL;
  }

  if(prevE !== null && prevE.OutIdx >= 0 && prevE.Top.y < pt.y && e.Top.y < pt.y) {
    var xPrev = Clipper.TopX(prevE, pt.y);
    var xE = Clipper.TopX(e, pt.y);
    if(
      xPrev === xE &&
      e.WindDelta !== 0 &&
      prevE.WindDelta !== 0 &&
      ClipperBase.SlopesEqual5(new FPoint2(xPrev, pt.y), prevE.Top, new FPoint2(xE, pt.y), e.Top)
    ) {
      var outPt = this.AddOutPt(prevE, pt);
      this.AddJoin(result, outPt, e.Top);
    }
  }
  return result;
};

Clipper.prototype.AddOutPt = function(e, pt) {
  if(e.OutIdx < 0) {
    var outRec = this.CreateOutRec();
    outRec.IsOpen = e.WindDelta === 0;
    var newOp = new OutPt();
    outRec.Pts = newOp;
    newOp.Idx = outRec.Idx;
    //newOp.Pt = pt;
    newOp.Pt.x = pt.x;
    newOp.Pt.y = pt.y;
    if(use_xyz) newOp.Pt.z = pt.z;
    newOp.Next = newOp;
    newOp.Prev = newOp;
    if(!outRec.IsOpen) this.SetHoleState(e, outRec);
    e.OutIdx = outRec.Idx;
    //nb: do this after SetZ !
    return newOp;
  } else {
    var outRec = this.m_PolyOuts[e.OutIdx];
    //OutRec.Pts is the 'Left-most' point & OutRec.Pts.Prev is the 'Right-most'
    var op = outRec.Pts;
    var ToFront = e.Side === EdgeSide.esLeft;
    if(ToFront && FPoint.op_Equality(pt, op.Pt)) return op;
    else if(!ToFront && FPoint.op_Equality(pt, op.Prev.Pt)) return op.Prev;
    var newOp = new OutPt();
    newOp.Idx = outRec.Idx;
    //newOp.Pt = pt;
    newOp.Pt.x = pt.x;
    newOp.Pt.y = pt.y;
    if(use_xyz) newOp.Pt.z = pt.z;
    newOp.Next = op;
    newOp.Prev = op.Prev;
    newOp.Prev.Next = newOp;
    op.Prev = newOp;
    if(ToFront) outRec.Pts = newOp;
    return newOp;
  }
};

Clipper.prototype.GetLastOutPt = function(e) {
  var outRec = this.m_PolyOuts[e.OutIdx];
  if(e.Side === EdgeSide.esLeft) {
    return outRec.Pts;
  } else {
    return outRec.Pts.Prev;
  }
};

Clipper.prototype.SwapPoints = function(pt1, pt2) {
  var tmp = new FPoint1(pt1.Value);
  //pt1.Value = pt2.Value;
  pt1.Value.x = pt2.Value.x;
  pt1.Value.y = pt2.Value.y;
  if(use_xyz) pt1.Value.z = pt2.Value.z;
  //pt2.Value = tmp;
  pt2.Value.x = tmp.x;
  pt2.Value.y = tmp.y;
  if(use_xyz) pt2.Value.z = tmp.z;
};

Clipper.prototype.HorzSegmentsOverlap = function(seg1a, seg1b, seg2a, seg2b) {
  var tmp;
  if(seg1a > seg1b) {
    tmp = seg1a;
    seg1a = seg1b;
    seg1b = tmp;
  }
  if(seg2a > seg2b) {
    tmp = seg2a;
    seg2a = seg2b;
    seg2b = tmp;
  }
  return seg1a < seg2b && seg2a < seg1b;
};

Clipper.prototype.SetHoleState = function(e, outRec) {
  var e2 = e.PrevInAEL;
  var eTmp = null;
  while(e2 !== null) {
    if(e2.OutIdx >= 0 && e2.WindDelta !== 0) {
      if(eTmp === null) eTmp = e2;
      else if(eTmp.OutIdx === e2.OutIdx) eTmp = null; //paired
    }
    e2 = e2.PrevInAEL;
  }

  if(eTmp === null) {
    outRec.FirstLeft = null;
    outRec.IsHole = false;
  } else {
    outRec.FirstLeft = this.m_PolyOuts[eTmp.OutIdx];
    outRec.IsHole = !outRec.FirstLeft.IsHole;
  }
};

Clipper.prototype.GetDx = function(pt1, pt2) {
  if(pt1.y === pt2.y) return ClipperBase.horizontal;
  else return (pt2.x - pt1.x) / (pt2.y - pt1.y);
};

Clipper.prototype.FirstIsBottomPt = function(btmPt1, btmPt2) {
  var p = btmPt1.Prev;
  while(FPoint.op_Equality(p.Pt, btmPt1.Pt) && p !== btmPt1) p = p.Prev;
  var dx1p = Math.abs(this.GetDx(btmPt1.Pt, p.Pt));
  p = btmPt1.Next;
  while(FPoint.op_Equality(p.Pt, btmPt1.Pt) && p !== btmPt1) p = p.Next;
  var dx1n = Math.abs(this.GetDx(btmPt1.Pt, p.Pt));
  p = btmPt2.Prev;
  while(FPoint.op_Equality(p.Pt, btmPt2.Pt) && p !== btmPt2) p = p.Prev;
  var dx2p = Math.abs(this.GetDx(btmPt2.Pt, p.Pt));
  p = btmPt2.Next;
  while(FPoint.op_Equality(p.Pt, btmPt2.Pt) && p !== btmPt2) p = p.Next;
  var dx2n = Math.abs(this.GetDx(btmPt2.Pt, p.Pt));

  if(
    Math.max(dx1p, dx1n) === Math.max(dx2p, dx2n) &&
    Math.min(dx1p, dx1n) === Math.min(dx2p, dx2n)
  ) {
    return this.Area(btmPt1) > 0; //if otherwise identical use orientation
  } else {
    return (dx1p >= dx2p && dx1p >= dx2n) || (dx1n >= dx2p && dx1n >= dx2n);
  }
};

Clipper.prototype.GetBottomPt = function(pp) {
  var dups = null;
  var p = pp.Next;
  while(p !== pp) {
    if(p.Pt.y > pp.Pt.y) {
      pp = p;
      dups = null;
    } else if(p.Pt.y === pp.Pt.y && p.Pt.x <= pp.Pt.x) {
      if(p.Pt.x < pp.Pt.x) {
        dups = null;
        pp = p;
      } else {
        if(p.Next !== pp && p.Prev !== pp) dups = p;
      }
    }
    p = p.Next;
  }
  if(dups !== null) {
    //there appears to be at least 2 vertices at bottomPt so ...
    while(dups !== p) {
      if(!this.FirstIsBottomPt(p, dups)) pp = dups;
      dups = dups.Next;
      while(FPoint.op_Inequality(dups.Pt, pp.Pt)) dups = dups.Next;
    }
  }
  return pp;
};

Clipper.prototype.GetLowermostRec = function(outRec1, outRec2) {
  //work out which polygon fragment has the correct hole state ...
  if(outRec1.BottomPt === null) outRec1.BottomPt = this.GetBottomPt(outRec1.Pts);
  if(outRec2.BottomPt === null) outRec2.BottomPt = this.GetBottomPt(outRec2.Pts);
  var bPt1 = outRec1.BottomPt;
  var bPt2 = outRec2.BottomPt;
  if(bPt1.Pt.y > bPt2.Pt.y) return outRec1;
  else if(bPt1.Pt.y < bPt2.Pt.y) return outRec2;
  else if(bPt1.Pt.x < bPt2.Pt.x) return outRec1;
  else if(bPt1.Pt.x > bPt2.Pt.x) return outRec2;
  else if(bPt1.Next === bPt1) return outRec2;
  else if(bPt2.Next === bPt2) return outRec1;
  else if(this.FirstIsBottomPt(bPt1, bPt2)) return outRec1;
  else return outRec2;
};

Clipper.prototype.OutRec1RightOfOutRec2 = function(outRec1, outRec2) {
  do {
    outRec1 = outRec1.FirstLeft;
    if(outRec1 === outRec2) return true;
  } while(outRec1 !== null);
  return false;
};

Clipper.prototype.GetOutRec = function(idx) {
  var outrec = this.m_PolyOuts[idx];
  while(outrec !== this.m_PolyOuts[outrec.Idx]) outrec = this.m_PolyOuts[outrec.Idx];
  return outrec;
};

Clipper.prototype.AppendPolygon = function(e1, e2) {
  //get the start and ends of both output polygons ...
  var outRec1 = this.m_PolyOuts[e1.OutIdx];
  var outRec2 = this.m_PolyOuts[e2.OutIdx];
  var holeStateRec;
  if(this.OutRec1RightOfOutRec2(outRec1, outRec2)) holeStateRec = outRec2;
  else if(this.OutRec1RightOfOutRec2(outRec2, outRec1)) holeStateRec = outRec1;
  else holeStateRec = this.GetLowermostRec(outRec1, outRec2);

  //get the start and ends of both output polygons and
  //join E2 poly onto E1 poly and delete pointers to E2 ...

  var p1_lft = outRec1.Pts;
  var p1_rt = p1_lft.Prev;
  var p2_lft = outRec2.Pts;
  var p2_rt = p2_lft.Prev;
  //join e2 poly onto e1 poly and delete pointers to e2 ...
  if(e1.Side === EdgeSide.esLeft) {
    if(e2.Side === EdgeSide.esLeft) {
      //z y x a b c
      this.ReversePolyPtLinks(p2_lft);
      p2_lft.Next = p1_lft;
      p1_lft.Prev = p2_lft;
      p1_rt.Next = p2_rt;
      p2_rt.Prev = p1_rt;
      outRec1.Pts = p2_rt;
    } else {
      //x y z a b c
      p2_rt.Next = p1_lft;
      p1_lft.Prev = p2_rt;
      p2_lft.Prev = p1_rt;
      p1_rt.Next = p2_lft;
      outRec1.Pts = p2_lft;
    }
  } else {
    if(e2.Side === EdgeSide.esRight) {
      //a b c z y x
      this.ReversePolyPtLinks(p2_lft);
      p1_rt.Next = p2_rt;
      p2_rt.Prev = p1_rt;
      p2_lft.Next = p1_lft;
      p1_lft.Prev = p2_lft;
    } else {
      //a b c x y z
      p1_rt.Next = p2_lft;
      p2_lft.Prev = p1_rt;
      p1_lft.Prev = p2_rt;
      p2_rt.Next = p1_lft;
    }
  }
  outRec1.BottomPt = null;
  if(holeStateRec === outRec2) {
    if(outRec2.FirstLeft !== outRec1) outRec1.FirstLeft = outRec2.FirstLeft;
    outRec1.IsHole = outRec2.IsHole;
  }
  outRec2.Pts = null;
  outRec2.BottomPt = null;
  outRec2.FirstLeft = outRec1;
  var OKIdx = e1.OutIdx;
  var ObsoleteIdx = e2.OutIdx;
  e1.OutIdx = -1;
  //nb: safe because we only get here via AddLocalMaxPoly
  e2.OutIdx = -1;
  var e = this.m_ActiveEdges;
  while(e !== null) {
    if(e.OutIdx === ObsoleteIdx) {
      e.OutIdx = OKIdx;
      e.Side = e1.Side;
      break;
    }
    e = e.NextInAEL;
  }
  outRec2.Idx = outRec1.Idx;
};

Clipper.prototype.ReversePolyPtLinks = function(pp) {
  if(pp === null) return;
  var pp1;
  var pp2;
  pp1 = pp;
  do {
    pp2 = pp1.Next;
    pp1.Next = pp1.Prev;
    pp1.Prev = pp2;
    pp1 = pp2;
  } while(pp1 !== pp);
};

Clipper.SwapSides = function(edge1, edge2) {
  var side = edge1.Side;
  edge1.Side = edge2.Side;
  edge2.Side = side;
};

Clipper.SwapPolyIndexes = function(edge1, edge2) {
  var outIdx = edge1.OutIdx;
  edge1.OutIdx = edge2.OutIdx;
  edge2.OutIdx = outIdx;
};

Clipper.prototype.IntersectEdges = function(e1, e2, pt) {
  //e1 will be to the left of e2 BELOW the intersection. Therefore e1 is before
  //e2 in AEL except when e1 is being inserted at the intersection point ...
  var e1Contributing = e1.OutIdx >= 0;
  var e2Contributing = e2.OutIdx >= 0;

  if(use_xyz) this.SetZ(pt, e1, e2);

  if(use_lines) {
    //if either edge is on an OPEN path ...
    if(e1.WindDelta === 0 || e2.WindDelta === 0) {
      //ignore subject-subject open path intersections UNLESS they
      //are both open paths, AND they are both 'contributing maximas' ...
      if(e1.WindDelta === 0 && e2.WindDelta === 0) return;
      //if intersecting a subj line with a subj poly ...
      else if(
        e1.PolyTyp === e2.PolyTyp &&
        e1.WindDelta !== e2.WindDelta &&
        this.m_ClipType === ClipType.ctUnion
      ) {
        if(e1.WindDelta === 0) {
          if(e2Contributing) {
            this.AddOutPt(e1, pt);
            if(e1Contributing) e1.OutIdx = -1;
          }
        } else {
          if(e1Contributing) {
            this.AddOutPt(e2, pt);
            if(e2Contributing) e2.OutIdx = -1;
          }
        }
      } else if(e1.PolyTyp !== e2.PolyTyp) {
        if(
          e1.WindDelta === 0 &&
          Math.abs(e2.WindCnt) === 1 &&
          (this.m_ClipType !== ClipType.ctUnion || e2.WindCnt2 === 0)
        ) {
          this.AddOutPt(e1, pt);
          if(e1Contributing) e1.OutIdx = -1;
        } else if(
          e2.WindDelta === 0 &&
          Math.abs(e1.WindCnt) === 1 &&
          (this.m_ClipType !== ClipType.ctUnion || e1.WindCnt2 === 0)
        ) {
          this.AddOutPt(e2, pt);
          if(e2Contributing) e2.OutIdx = -1;
        }
      }
      return;
    }
  }
  //update winding counts...
  //assumes that e1 will be to the Right of e2 ABOVE the intersection
  if(e1.PolyTyp === e2.PolyTyp) {
    if(this.IsEvenOddFillType(e1)) {
      var oldE1WindCnt = e1.WindCnt;
      e1.WindCnt = e2.WindCnt;
      e2.WindCnt = oldE1WindCnt;
    } else {
      if(e1.WindCnt + e2.WindDelta === 0) e1.WindCnt = -e1.WindCnt;
      else e1.WindCnt += e2.WindDelta;
      if(e2.WindCnt - e1.WindDelta === 0) e2.WindCnt = -e2.WindCnt;
      else e2.WindCnt -= e1.WindDelta;
    }
  } else {
    if(!this.IsEvenOddFillType(e2)) e1.WindCnt2 += e2.WindDelta;
    else e1.WindCnt2 = e1.WindCnt2 === 0 ? 1 : 0;
    if(!this.IsEvenOddFillType(e1)) e2.WindCnt2 -= e1.WindDelta;
    else e2.WindCnt2 = e2.WindCnt2 === 0 ? 1 : 0;
  }
  var e1FillType, e2FillType, e1FillType2, e2FillType2;
  if(e1.PolyTyp === PolyType.ptSubject) {
    e1FillType = this.m_SubjFillType;
    e1FillType2 = this.m_ClipFillType;
  } else {
    e1FillType = this.m_ClipFillType;
    e1FillType2 = this.m_SubjFillType;
  }
  if(e2.PolyTyp === PolyType.ptSubject) {
    e2FillType = this.m_SubjFillType;
    e2FillType2 = this.m_ClipFillType;
  } else {
    e2FillType = this.m_ClipFillType;
    e2FillType2 = this.m_SubjFillType;
  }
  var e1Wc, e2Wc;
  switch (e1FillType) {
    case PolyFillType.pftPositive:
      e1Wc = e1.WindCnt;
      break;
    case PolyFillType.pftNegative:
      e1Wc = -e1.WindCnt;
      break;
    default:
      e1Wc = Math.abs(e1.WindCnt);
      break;
  }
  switch (e2FillType) {
    case PolyFillType.pftPositive:
      e2Wc = e2.WindCnt;
      break;
    case PolyFillType.pftNegative:
      e2Wc = -e2.WindCnt;
      break;
    default:
      e2Wc = Math.abs(e2.WindCnt);
      break;
  }
  if(e1Contributing && e2Contributing) {
    if(
      (e1Wc !== 0 && e1Wc !== 1) ||
      (e2Wc !== 0 && e2Wc !== 1) ||
      (e1.PolyTyp !== e2.PolyTyp && this.m_ClipType !== ClipType.ctXor)
    ) {
      this.AddLocalMaxPoly(e1, e2, pt);
    } else {
      this.AddOutPt(e1, pt);
      this.AddOutPt(e2, pt);
      Clipper.SwapSides(e1, e2);
      Clipper.SwapPolyIndexes(e1, e2);
    }
  } else if(e1Contributing) {
    if(e2Wc === 0 || e2Wc === 1) {
      this.AddOutPt(e1, pt);
      Clipper.SwapSides(e1, e2);
      Clipper.SwapPolyIndexes(e1, e2);
    }
  } else if(e2Contributing) {
    if(e1Wc === 0 || e1Wc === 1) {
      this.AddOutPt(e2, pt);
      Clipper.SwapSides(e1, e2);
      Clipper.SwapPolyIndexes(e1, e2);
    }
  } else if((e1Wc === 0 || e1Wc === 1) && (e2Wc === 0 || e2Wc === 1)) {
    //neither edge is currently contributing ...
    var e1Wc2, e2Wc2;
    switch (e1FillType2) {
      case PolyFillType.pftPositive:
        e1Wc2 = e1.WindCnt2;
        break;
      case PolyFillType.pftNegative:
        e1Wc2 = -e1.WindCnt2;
        break;
      default:
        e1Wc2 = Math.abs(e1.WindCnt2);
        break;
    }
    switch (e2FillType2) {
      case PolyFillType.pftPositive:
        e2Wc2 = e2.WindCnt2;
        break;
      case PolyFillType.pftNegative:
        e2Wc2 = -e2.WindCnt2;
        break;
      default:
        e2Wc2 = Math.abs(e2.WindCnt2);
        break;
    }
    if(e1.PolyTyp !== e2.PolyTyp) {
      this.AddLocalMinPoly(e1, e2, pt);
    } else if(e1Wc === 1 && e2Wc === 1)
      switch (this.m_ClipType) {
        case ClipType.ctIntersection:
          if(e1Wc2 > 0 && e2Wc2 > 0) this.AddLocalMinPoly(e1, e2, pt);
          break;
        case ClipType.ctUnion:
          if(e1Wc2 <= 0 && e2Wc2 <= 0) this.AddLocalMinPoly(e1, e2, pt);
          break;
        case ClipType.ctDifference:
          if(
            (e1.PolyTyp === PolyType.ptClip && e1Wc2 > 0 && e2Wc2 > 0) ||
            (e1.PolyTyp === PolyType.ptSubject && e1Wc2 <= 0 && e2Wc2 <= 0)
          )
            this.AddLocalMinPoly(e1, e2, pt);
          break;
        case ClipType.ctXor:
          this.AddLocalMinPoly(e1, e2, pt);
          break;
      }
    else Clipper.SwapSides(e1, e2);
  }
};

Clipper.prototype.DeleteFromSEL = function(e) {
  var SelPrev = e.PrevInSEL;
  var SelNext = e.NextInSEL;
  if(SelPrev === null && SelNext === null && e !== this.m_SortedEdges) return;
  //already deleted
  if(SelPrev !== null) SelPrev.NextInSEL = SelNext;
  else this.m_SortedEdges = SelNext;
  if(SelNext !== null) SelNext.PrevInSEL = SelPrev;
  e.NextInSEL = null;
  e.PrevInSEL = null;
};

Clipper.prototype.ProcessHorizontals = function() {
  var horzEdge = {}; //m_SortedEdges;
  while(this.PopEdgeFromSEL(horzEdge)) {
    this.ProcessHorizontal(horzEdge.v);
  }
};

Clipper.prototype.GetHorzDirection = function(HorzEdge, $var) {
  if(HorzEdge.Bot.x < HorzEdge.Top.x) {
    $var.Left = HorzEdge.Bot.x;
    $var.Right = HorzEdge.Top.x;
    $var.Dir = Direction.dLeftToRight;
  } else {
    $var.Left = HorzEdge.Top.x;
    $var.Right = HorzEdge.Bot.x;
    $var.Dir = Direction.dRightToLeft;
  }
};

Clipper.prototype.ProcessHorizontal = function(horzEdge) {
  var $var = {
    Dir: null,
    Left: null,
    Right: null
  };

  this.GetHorzDirection(horzEdge, $var);
  var dir = $var.Dir;
  var horzLeft = $var.Left;
  var horzRight = $var.Right;

  var IsOpen = horzEdge.WindDelta === 0;

  var eLastHorz = horzEdge,
    eMaxPair = null;
  while(eLastHorz.NextInLML !== null && ClipperBase.IsHorizontal(eLastHorz.NextInLML))
    eLastHorz = eLastHorz.NextInLML;
  if(eLastHorz.NextInLML === null) eMaxPair = this.GetMaximaPair(eLastHorz);

  var currMax = this.m_Maxima;
  if(currMax !== null) {
    //get the first maxima in range (x) ...
    if(dir === Direction.dLeftToRight) {
      while(currMax !== null && currMax.x <= horzEdge.Bot.x) {
        currMax = currMax.Next;
      }
      if(currMax !== null && currMax.x >= eLastHorz.Top.x) {
        currMax = null;
      }
    } else {
      while(currMax.Next !== null && currMax.Next.x < horzEdge.Bot.x) {
        currMax = currMax.Next;
      }
      if(currMax.x <= eLastHorz.Top.x) {
        currMax = null;
      }
    }
  }
  var op1 = null;
  for(;;) //loop through consec. horizontal edges
  {
    var IsLastHorz = horzEdge === eLastHorz;
    var e = this.GetNextInAEL(horzEdge, dir);
    while(e !== null) {
      //this code block inserts extra coords into horizontal edges (in output
      //polygons) whereever maxima touch these horizontal edges. This helps
      //'simplifying' polygons (ie if the Simplify property is set).
      if(currMax !== null) {
        if(dir === Direction.dLeftToRight) {
          while(currMax !== null && currMax.x < e.Curr.x) {
            if(horzEdge.OutIdx >= 0 && !IsOpen) {
              this.AddOutPt(horzEdge, new FPoint2(currMax.x, horzEdge.Bot.y));
            }
            currMax = currMax.Next;
          }
        } else {
          while(currMax !== null && currMax.x > e.Curr.x) {
            if(horzEdge.OutIdx >= 0 && !IsOpen) {
              this.AddOutPt(horzEdge, new FPoint2(currMax.x, horzEdge.Bot.y));
            }
            currMax = currMax.Prev;
          }
        }
      }

      if(
        (dir === Direction.dLeftToRight && e.Curr.x > horzRight) ||
        (dir === Direction.dRightToLeft && e.Curr.x < horzLeft)
      ) {
        break;
      }

      //Also break if we've got to the end of an intermediate horizontal edge ...
      //nb: Smaller Dx's are to the right of larger Dx's ABOVE the horizontal.
      if(
        e.Curr.x === horzEdge.Top.x &&
        horzEdge.NextInLML !== null &&
        e.Dx < horzEdge.NextInLML.Dx
      )
        break;

      if(horzEdge.OutIdx >= 0 && !IsOpen) {
        //note: may be done multiple times
        if(use_xyz) {
          if(dir === Direction.dLeftToRight) this.SetZ(e.Curr, horzEdge, e);
          else this.SetZ(e.Curr, e, horzEdge);
        }

        op1 = this.AddOutPt(horzEdge, e.Curr);
        var eNextHorz = this.m_SortedEdges;
        while(eNextHorz !== null) {
          if(
            eNextHorz.OutIdx >= 0 &&
            this.HorzSegmentsOverlap(
              horzEdge.Bot.x,
              horzEdge.Top.x,
              eNextHorz.Bot.x,
              eNextHorz.Top.x
            )
          ) {
            var op2 = this.GetLastOutPt(eNextHorz);
            this.AddJoin(op2, op1, eNextHorz.Top);
          }
          eNextHorz = eNextHorz.NextInSEL;
        }
        this.AddGhostJoin(op1, horzEdge.Bot);
      }

      //OK, so far we're still in range of the horizontal Edge  but make sure
      //we're at the last of consec. horizontals when matching with eMaxPair
      if(e === eMaxPair && IsLastHorz) {
        if(horzEdge.OutIdx >= 0) {
          this.AddLocalMaxPoly(horzEdge, eMaxPair, horzEdge.Top);
        }
        this.DeleteFromAEL(horzEdge);
        this.DeleteFromAEL(eMaxPair);
        return;
      }

      if(dir === Direction.dLeftToRight) {
        var Pt = new FPoint2(e.Curr.x, horzEdge.Curr.y);
        this.IntersectEdges(horzEdge, e, Pt);
      } else {
        var Pt = new FPoint2(e.Curr.x, horzEdge.Curr.y);
        this.IntersectEdges(e, horzEdge, Pt);
      }
      var eNext = this.GetNextInAEL(e, dir);
      this.SwapPositionsInAEL(horzEdge, e);
      e = eNext;
    } //end while(e !== null)

    //Break out of loop if HorzEdge.NextInLML is not also horizontal ...
    if(horzEdge.NextInLML === null || !ClipperBase.IsHorizontal(horzEdge.NextInLML)) {
      break;
    }

    horzEdge = this.UpdateEdgeIntoAEL(horzEdge);
    if(horzEdge.OutIdx >= 0) {
      this.AddOutPt(horzEdge, horzEdge.Bot);
    }

    $var = {
      Dir: dir,
      Left: horzLeft,
      Right: horzRight
    };

    this.GetHorzDirection(horzEdge, $var);
    dir = $var.Dir;
    horzLeft = $var.Left;
    horzRight = $var.Right;
  } //end for(;;)

  if(horzEdge.OutIdx >= 0 && op1 === null) {
    op1 = this.GetLastOutPt(horzEdge);
    var eNextHorz = this.m_SortedEdges;
    while(eNextHorz !== null) {
      if(
        eNextHorz.OutIdx >= 0 &&
        this.HorzSegmentsOverlap(horzEdge.Bot.x, horzEdge.Top.x, eNextHorz.Bot.x, eNextHorz.Top.x)
      ) {
        var op2 = this.GetLastOutPt(eNextHorz);
        this.AddJoin(op2, op1, eNextHorz.Top);
      }
      eNextHorz = eNextHorz.NextInSEL;
    }
    this.AddGhostJoin(op1, horzEdge.Top);
  }

  if(horzEdge.NextInLML !== null) {
    if(horzEdge.OutIdx >= 0) {
      op1 = this.AddOutPt(horzEdge, horzEdge.Top);

      horzEdge = this.UpdateEdgeIntoAEL(horzEdge);
      if(horzEdge.WindDelta === 0) {
        return;
      }
      //nb: HorzEdge is no longer horizontal here
      var ePrev = horzEdge.PrevInAEL;
      var eNext = horzEdge.NextInAEL;
      if(
        ePrev !== null &&
        ePrev.Curr.x === horzEdge.Bot.x &&
        ePrev.Curr.y === horzEdge.Bot.y &&
        ePrev.WindDelta === 0 &&
        ePrev.OutIdx >= 0 &&
        ePrev.Curr.y > ePrev.Top.y &&
        ClipperBase.SlopesEqual3(horzEdge, ePrev)
      ) {
        var op2 = this.AddOutPt(ePrev, horzEdge.Bot);
        this.AddJoin(op1, op2, horzEdge.Top);
      } else if(
        eNext !== null &&
        eNext.Curr.x === horzEdge.Bot.x &&
        eNext.Curr.y === horzEdge.Bot.y &&
        eNext.WindDelta !== 0 &&
        eNext.OutIdx >= 0 &&
        eNext.Curr.y > eNext.Top.y &&
        ClipperBase.SlopesEqual3(horzEdge, eNext)
      ) {
        var op2 = this.AddOutPt(eNext, horzEdge.Bot);
        this.AddJoin(op1, op2, horzEdge.Top);
      }
    } else {
      horzEdge = this.UpdateEdgeIntoAEL(horzEdge);
    }
  } else {
    if(horzEdge.OutIdx >= 0) {
      this.AddOutPt(horzEdge, horzEdge.Top);
    }
    this.DeleteFromAEL(horzEdge);
  }
};

Clipper.prototype.GetNextInAEL = function(e, Direction) {
  return Direction === Direction.dLeftToRight ? e.NextInAEL : e.PrevInAEL;
};

Clipper.prototype.IsMinima = function(e) {
  return e !== null && e.Prev.NextInLML !== e && e.Next.NextInLML !== e;
};

Clipper.prototype.IsMaxima = function(e, y) {
  return e !== null && e.Top.y === y && e.NextInLML === null;
};

Clipper.prototype.IsIntermediate = function(e, y) {
  return e.Top.y === y && e.NextInLML !== null;
};

Clipper.prototype.GetMaximaPair = function(e) {
  if(FPoint.op_Equality(e.Next.Top, e.Top) && e.Next.NextInLML === null) {
    return e.Next;
  } else {
    if(FPoint.op_Equality(e.Prev.Top, e.Top) && e.Prev.NextInLML === null) {
      return e.Prev;
    } else {
      return null;
    }
  }
};

Clipper.prototype.GetMaximaPairEx = function(e) {
  //as above but returns null if MaxPair isn't in AEL (unless it's horizontal)
  var result = this.GetMaximaPair(e);
  if(
    result === null ||
    result.OutIdx === ClipperBase.Skip ||
    (result.NextInAEL === result.PrevInAEL && !ClipperBase.IsHorizontal(result))
  ) {
    return null;
  }
  return result;
};

Clipper.prototype.ProcessIntersections = function(topY) {
  if(this.m_ActiveEdges === null) return true;
  try {
    this.BuildIntersectList(topY);
    if(this.m_IntersectList.length === 0) return true;
    if(this.m_IntersectList.length === 1 || this.FixupIntersectionOrder())
      this.ProcessIntersectList();
    else return false;
  } catch($$e2) {
    this.m_SortedEdges = null;
    this.m_IntersectList.length = 0;
    ClipperLib.Error('ProcessIntersections error');
  }
  this.m_SortedEdges = null;
  return true;
};

Clipper.prototype.BuildIntersectList = function(topY) {
  if(this.m_ActiveEdges === null) return;
  //prepare for sorting ...
  var e = this.m_ActiveEdges;
  //console.log(JSON.stringify(JSON.decycle( e )));
  this.m_SortedEdges = e;
  while(e !== null) {
    e.PrevInSEL = e.PrevInAEL;
    e.NextInSEL = e.NextInAEL;
    e.Curr.x = Clipper.TopX(e, topY);
    e = e.NextInAEL;
  }
  //bubblesort ...
  var isModified = true;
  while(isModified && this.m_SortedEdges !== null) {
    isModified = false;
    e = this.m_SortedEdges;
    while(e.NextInSEL !== null) {
      var eNext = e.NextInSEL;
      var pt = new FPoint0();
      //console.log("e.Curr.x: " + e.Curr.x + " eNext.Curr.x" + eNext.Curr.x);
      if(e.Curr.x > eNext.Curr.x) {
        this.IntersectPoint(e, eNext, pt);
        if(pt.y < topY) {
          pt = new FPoint2(Clipper.TopX(e, topY), topY);
        }
        var newNode = new IntersectNode();
        newNode.Edge1 = e;
        newNode.Edge2 = eNext;
        //newNode.Pt = pt;
        newNode.Pt.x = pt.x;
        newNode.Pt.y = pt.y;
        if(use_xyz) newNode.Pt.z = pt.z;
        this.m_IntersectList.push(newNode);
        this.SwapPositionsInSEL(e, eNext);
        isModified = true;
      } else e = eNext;
    }
    if(e.PrevInSEL !== null) e.PrevInSEL.NextInSEL = null;
    else break;
  }
  this.m_SortedEdges = null;
};

Clipper.prototype.EdgesAdjacent = function(inode) {
  return inode.Edge1.NextInSEL === inode.Edge2 || inode.Edge1.PrevInSEL === inode.Edge2;
};

Clipper.IntersectNodeSort = function(node1, node2) {
  //the following typecast is safe because the differences in Pt.y will
  //be limited to the height of the scanbeam.
  return node2.Pt.y - node1.Pt.y;
};

Clipper.prototype.FixupIntersectionOrder = function() {
  //pre-condition: intersections are sorted bottom-most first.
  //Now it's crucial that intersections are made only between adjacent edges,
  //so to ensure this the order of intersections may need adjusting ...
  this.m_IntersectList.sort(this.m_IntersectNodeComparer);
  this.CopyAELToSEL();
  var cnt = this.m_IntersectList.length;
  for(var i = 0; i < cnt; i++) {
    if(!this.EdgesAdjacent(this.m_IntersectList[i])) {
      var j = i + 1;
      while(j < cnt && !this.EdgesAdjacent(this.m_IntersectList[j])) j++;
      if(j === cnt) return false;
      var tmp = this.m_IntersectList[i];
      this.m_IntersectList[i] = this.m_IntersectList[j];
      this.m_IntersectList[j] = tmp;
    }
    this.SwapPositionsInSEL(this.m_IntersectList[i].Edge1, this.m_IntersectList[i].Edge2);
  }
  return true;
};

Clipper.prototype.ProcessIntersectList = function() {
  for(var i = 0, ilen = this.m_IntersectList.length; i < ilen; i++) {
    var iNode = this.m_IntersectList[i];
    this.IntersectEdges(iNode.Edge1, iNode.Edge2, iNode.Pt);
    this.SwapPositionsInAEL(iNode.Edge1, iNode.Edge2);
  }
  this.m_IntersectList.length = 0;
};

Clipper.TopX = function(edge, currentY) {
  //if (edge.Bot == edge.Curr) alert ("edge.Bot = edge.Curr");
  //if (edge.Bot == edge.Top) alert ("edge.Bot = edge.Top");
  if(currentY === edge.Top.y) return edge.Top.x;
  return edge.Bot.x + edge.Dx * (currentY - edge.Bot.y);
};

Clipper.prototype.IntersectPoint = function(edge1, edge2, ip) {
  ip.x = 0;
  ip.y = 0;
  var b1, b2;
  //nb: with very large coordinate values, it's possible for SlopesEqual() to
  //return false but for the edge.Dx value be equal due to double precision rounding.
  if(edge1.Dx === edge2.Dx) {
    ip.y = edge1.Curr.y;
    ip.x = Clipper.TopX(edge1, ip.y);
    return;
  }
  if(edge1.Delta.x === 0) {
    ip.x = edge1.Bot.x;
    if(ClipperBase.IsHorizontal(edge2)) {
      ip.y = edge2.Bot.y;
    } else {
      b2 = edge2.Bot.y - edge2.Bot.x / edge2.Dx;
      ip.y = ip.x / edge2.Dx + b2;
    }
  } else if(edge2.Delta.x === 0) {
    ip.x = edge2.Bot.x;
    if(ClipperBase.IsHorizontal(edge1)) {
      ip.y = edge1.Bot.y;
    } else {
      b1 = edge1.Bot.y - edge1.Bot.x / edge1.Dx;
      ip.y = ip.x / edge1.Dx + b1;
    }
  } else {
    b1 = edge1.Bot.x - edge1.Bot.y * edge1.Dx;
    b2 = edge2.Bot.x - edge2.Bot.y * edge2.Dx;
    var q = (b2 - b1) / (edge1.Dx - edge2.Dx);
    ip.y = q;
    if(Math.abs(edge1.Dx) < Math.abs(edge2.Dx)) ip.x = edge1.Dx * q + b1;
    else ip.x = edge2.Dx * q + b2;
  }
  if(ip.y < edge1.Top.y || ip.y < edge2.Top.y) {
    if(edge1.Top.y > edge2.Top.y) {
      ip.y = edge1.Top.y;
      ip.x = Clipper.TopX(edge2, edge1.Top.y);
      return ip.x < edge1.Top.x;
    } else ip.y = edge2.Top.y;
    if(Math.abs(edge1.Dx) < Math.abs(edge2.Dx)) ip.x = Clipper.TopX(edge1, ip.y);
    else ip.x = Clipper.TopX(edge2, ip.y);
  }
  //finally, don't allow 'ip' to be BELOW curr.y (ie bottom of scanbeam) ...
  if(ip.y > edge1.Curr.y) {
    ip.y = edge1.Curr.y;
    //better to use the more vertical edge to derive x ...
    if(Math.abs(edge1.Dx) > Math.abs(edge2.Dx)) ip.x = Clipper.TopX(edge2, ip.y);
    else ip.x = Clipper.TopX(edge1, ip.y);
  }
};

Clipper.prototype.ProcessEdgesAtTopOfScanbeam = function(topY) {
  var e = this.m_ActiveEdges;

  while(e !== null) {
    //1. process maxima, treating them as if they're 'bent' horizontal edges,
    //   but exclude maxima with horizontal edges. nb: e can't be a horizontal.
    var IsMaximaEdge = this.IsMaxima(e, topY);
    if(IsMaximaEdge) {
      var eMaxPair = this.GetMaximaPairEx(e);
      IsMaximaEdge = eMaxPair === null || !ClipperBase.IsHorizontal(eMaxPair);
    }
    if(IsMaximaEdge) {
      if(this.StrictlySimple) {
        this.InsertMaxima(e.Top.x);
      }
      var ePrev = e.PrevInAEL;
      this.DoMaxima(e);
      if(ePrev === null) e = this.m_ActiveEdges;
      else e = ePrev.NextInAEL;
    } else {
      //2. promote horizontal edges, otherwise update Curr.x and Curr.y ...
      if(this.IsIntermediate(e, topY) && ClipperBase.IsHorizontal(e.NextInLML)) {
        e = this.UpdateEdgeIntoAEL(e);
        if(e.OutIdx >= 0) this.AddOutPt(e, e.Bot);
        this.AddEdgeToSEL(e);
      } else {
        e.Curr.x = Clipper.TopX(e, topY);
        e.Curr.y = topY;
      }

      if(use_xyz) {
        if(e.Top.y === topY) e.Curr.z = e.Top.z;
        else if(e.Bot.y === topY) e.Curr.z = e.Bot.z;
        else e.Curr.z = 0;
      }

      //When StrictlySimple and 'e' is being touched by another edge, then
      //make sure both edges have a vertex here ...
      if(this.StrictlySimple) {
        var ePrev = e.PrevInAEL;
        if(
          e.OutIdx >= 0 &&
          e.WindDelta !== 0 &&
          ePrev !== null &&
          ePrev.OutIdx >= 0 &&
          ePrev.Curr.x === e.Curr.x &&
          ePrev.WindDelta !== 0
        ) {
          var ip = new FPoint1(e.Curr);

          if(use_xyz) {
            this.SetZ(ip, ePrev, e);
          }

          var op = this.AddOutPt(ePrev, ip);
          var op2 = this.AddOutPt(e, ip);
          this.AddJoin(op, op2, ip); //StrictlySimple (type-3) join
        }
      }
      e = e.NextInAEL;
    }
  }
  //3. Process horizontals at the Top of the scanbeam ...
  this.ProcessHorizontals();
  this.m_Maxima = null;
  //4. Promote intermediate vertices ...
  e = this.m_ActiveEdges;
  while(e !== null) {
    if(this.IsIntermediate(e, topY)) {
      var op = null;
      if(e.OutIdx >= 0) op = this.AddOutPt(e, e.Top);
      e = this.UpdateEdgeIntoAEL(e);
      //if output polygons share an edge, they'll need joining later ...
      var ePrev = e.PrevInAEL;
      var eNext = e.NextInAEL;

      if(
        ePrev !== null &&
        ePrev.Curr.x === e.Bot.x &&
        ePrev.Curr.y === e.Bot.y &&
        op !== null &&
        ePrev.OutIdx >= 0 &&
        ePrev.Curr.y === ePrev.Top.y &&
        ClipperBase.SlopesEqual5(e.Curr, e.Top, ePrev.Curr, ePrev.Top) &&
        e.WindDelta !== 0 &&
        ePrev.WindDelta !== 0
      ) {
        var op2 = this.AddOutPt(ePrev2, e.Bot);
        this.AddJoin(op, op2, e.Top);
      } else if(
        eNext !== null &&
        eNext.Curr.x === e.Bot.x &&
        eNext.Curr.y === e.Bot.y &&
        op !== null &&
        eNext.OutIdx >= 0 &&
        eNext.Curr.y === eNext.Top.y &&
        ClipperBase.SlopesEqual5(e.Curr, e.Top, eNext.Curr, eNext.Top) &&
        e.WindDelta !== 0 &&
        eNext.WindDelta !== 0
      ) {
        var op2 = this.AddOutPt(eNext, e.Bot);
        this.AddJoin(op, op2, e.Top);
      }
    }
    e = e.NextInAEL;
  }
};

Clipper.prototype.DoMaxima = function(e) {
  var eMaxPair = this.GetMaximaPairEx(e);
  if(eMaxPair === null) {
    if(e.OutIdx >= 0) this.AddOutPt(e, e.Top);
    this.DeleteFromAEL(e);
    return;
  }
  var eNext = e.NextInAEL;
  while(eNext !== null && eNext !== eMaxPair) {
    this.IntersectEdges(e, eNext, e.Top);
    this.SwapPositionsInAEL(e, eNext);
    eNext = e.NextInAEL;
  }
  if(e.OutIdx === -1 && eMaxPair.OutIdx === -1) {
    this.DeleteFromAEL(e);
    this.DeleteFromAEL(eMaxPair);
  } else if(e.OutIdx >= 0 && eMaxPair.OutIdx >= 0) {
    if(e.OutIdx >= 0) this.AddLocalMaxPoly(e, eMaxPair, e.Top);
    this.DeleteFromAEL(e);
    this.DeleteFromAEL(eMaxPair);
  } else if(use_lines && e.WindDelta === 0) {
    if(e.OutIdx >= 0) {
      this.AddOutPt(e, e.Top);
      e.OutIdx = ClipperBase.Unassigned;
    }
    this.DeleteFromAEL(e);
    if(eMaxPair.OutIdx >= 0) {
      this.AddOutPt(eMaxPair, e.Top);
      eMaxPair.OutIdx = ClipperBase.Unassigned;
    }
    this.DeleteFromAEL(eMaxPair);
  } else ClipperLib.Error('DoMaxima error');
};

Clipper.ReversePaths = function(polys) {
  for(var i = 0, len = polys.length; i < len; i++) polys[i].reverse();
};

Clipper.Orientation = function(poly) {
  return Clipper.Area(poly) >= 0;
};

Clipper.prototype.PointCount = function(pts) {
  if(pts === null) return 0;
  var result = 0;
  var p = pts;
  do {
    result++;
    p = p.Next;
  } while(p !== pts);
  return result;
};

Clipper.prototype.BuildResult = function(polyg) {
  Clear(polyg);
  for(var i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++) {
    var outRec = this.m_PolyOuts[i];
    if(outRec.Pts === null) continue;
    var p = outRec.Pts.Prev;
    var cnt = this.PointCount(p);
    if(cnt < 2) continue;
    var pg = new Array(cnt);
    for(var j = 0; j < cnt; j++) {
      pg[j] = p.Pt;
      p = p.Prev;
    }
    polyg.push(pg);
  }
};

Clipper.prototype.BuildResult2 = function(polytree) {
  polytree.Clear();
  //add each output polygon/contour to polytree ...
  //polytree.m_AllPolys.set_Capacity(this.m_PolyOuts.length);
  for(var i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++) {
    var outRec = this.m_PolyOuts[i];
    var cnt = this.PointCount(outRec.Pts);
    if((outRec.IsOpen && cnt < 2) || (!outRec.IsOpen && cnt < 3)) continue;
    this.FixHoleLinkage(outRec);
    var pn = new PolyNode();
    polytree.m_AllPolys.push(pn);
    outRec.PolyNode = pn;
    pn.m_polygon.length = cnt;
    var op = outRec.Pts.Prev;
    for(var j = 0; j < cnt; j++) {
      pn.m_polygon[j] = op.Pt;
      op = op.Prev;
    }
  }
  //fixup PolyNode links etc ...
  //polytree.m_Childs.set_Capacity(this.m_PolyOuts.length);
  for(var i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++) {
    var outRec = this.m_PolyOuts[i];
    if(outRec.PolyNode === null) continue;
    else if(outRec.IsOpen) {
      outRec.PolyNode.IsOpen = true;
      polytree.AddChild(outRec.PolyNode);
    } else if(outRec.FirstLeft !== null && outRec.FirstLeft.PolyNode !== null)
      outRec.FirstLeft.PolyNode.AddChild(outRec.PolyNode);
    else polytree.AddChild(outRec.PolyNode);
  }
};

Clipper.prototype.FixupOutPolyline = function(outRec) {
  var pp = outRec.Pts;
  var lastPP = pp.Prev;
  while(pp !== lastPP) {
    pp = pp.Next;
    if(FPoint.op_Equality(pp.Pt, pp.Prev.Pt)) {
      if(pp === lastPP) {
        lastPP = pp.Prev;
      }
      var tmpPP = pp.Prev;
      tmpPP.Next = pp.Next;
      pp.Next.Prev = tmpPP;
      pp = tmpPP;
    }
  }
  if(pp === pp.Prev) {
    outRec.Pts = null;
  }
};

Clipper.prototype.FixupOutPolygon = function(outRec) {
  //FixupOutPolygon() - removes duplicate points and simplifies consecutive
  //parallel edges by removing the middle vertex.
  var lastOK = null;
  outRec.BottomPt = null;
  var pp = outRec.Pts;
  var preserveCol = this.PreserveCollinear || this.StrictlySimple;
  for(;;) {
    if(pp.Prev === pp || pp.Prev === pp.Next) {
      outRec.Pts = null;
      return;
    }

    //test for duplicate points and collinear edges ...
    if(
      FPoint.op_Equality(pp.Pt, pp.Next.Pt) ||
      FPoint.op_Equality(pp.Pt, pp.Prev.Pt) ||
      (ClipperBase.SlopesEqual4(pp.Prev.Pt, pp.Pt, pp.Next.Pt) &&
        (!preserveCol || !this.Pt2IsBetweenPt1AndPt3(pp.Prev.Pt, pp.Pt, pp.Next.Pt)))
    ) {
      lastOK = null;
      pp.Prev.Next = pp.Next;
      pp.Next.Prev = pp.Prev;
      pp = pp.Prev;
    } else if(pp === lastOK) break;
    else {
      if(lastOK === null) lastOK = pp;
      pp = pp.Next;
    }
  }
  outRec.Pts = pp;
};

Clipper.prototype.DupOutPt = function(outPt, InsertAfter) {
  var result = new OutPt();
  //result.Pt = outPt.Pt;
  result.Pt.x = outPt.Pt.x;
  result.Pt.y = outPt.Pt.y;
  if(use_xyz) result.Pt.z = outPt.Pt.z;
  result.Idx = outPt.Idx;
  if(InsertAfter) {
    result.Next = outPt.Next;
    result.Prev = outPt;
    outPt.Next.Prev = result;
    outPt.Next = result;
  } else {
    result.Prev = outPt.Prev;
    result.Next = outPt;
    outPt.Prev.Next = result;
    outPt.Prev = result;
  }
  return result;
};

Clipper.prototype.GetOverlap = function(a1, a2, b1, b2, $val) {
  if(a1 < a2) {
    if(b1 < b2) {
      $val.Left = Math.max(a1, b1);
      $val.Right = Math.min(a2, b2);
    } else {
      $val.Left = Math.max(a1, b2);
      $val.Right = Math.min(a2, b1);
    }
  } else {
    if(b1 < b2) {
      $val.Left = Math.max(a2, b1);
      $val.Right = Math.min(a1, b2);
    } else {
      $val.Left = Math.max(a2, b2);
      $val.Right = Math.min(a1, b1);
    }
  }
  return $val.Left < $val.Right;
};

Clipper.prototype.JoinHorz = function(op1, op1b, op2, op2b, Pt, DiscardLeft) {
  var Dir1 = op1.Pt.x > op1b.Pt.x ? Direction.dRightToLeft : Direction.dLeftToRight;
  var Dir2 = op2.Pt.x > op2b.Pt.x ? Direction.dRightToLeft : Direction.dLeftToRight;
  if(Dir1 === Dir2) return false;
  //When DiscardLeft, we want Op1b to be on the Left of Op1, otherwise we
  //want Op1b to be on the Right. (And likewise with Op2 and Op2b.)
  //So, to facilitate this while inserting Op1b and Op2b ...
  //when DiscardLeft, make sure we're AT or RIGHT of Pt before adding Op1b,
  //otherwise make sure we're AT or LEFT of Pt. (Likewise with Op2b.)
  if(Dir1 === Direction.dLeftToRight) {
    while(op1.Next.Pt.x <= Pt.x && op1.Next.Pt.x >= op1.Pt.x && op1.Next.Pt.y === Pt.y)
      op1 = op1.Next;
    if(DiscardLeft && op1.Pt.x !== Pt.x) op1 = op1.Next;
    op1b = this.DupOutPt(op1, !DiscardLeft);
    if(FPoint.op_Inequality(op1b.Pt, Pt)) {
      op1 = op1b;
      //op1.Pt = Pt;
      op1.Pt.x = Pt.x;
      op1.Pt.y = Pt.y;
      if(use_xyz) op1.Pt.z = Pt.z;
      op1b = this.DupOutPt(op1, !DiscardLeft);
    }
  } else {
    while(op1.Next.Pt.x >= Pt.x && op1.Next.Pt.x <= op1.Pt.x && op1.Next.Pt.y === Pt.y)
      op1 = op1.Next;
    if(!DiscardLeft && op1.Pt.x !== Pt.x) op1 = op1.Next;
    op1b = this.DupOutPt(op1, DiscardLeft);
    if(FPoint.op_Inequality(op1b.Pt, Pt)) {
      op1 = op1b;
      //op1.Pt = Pt;
      op1.Pt.x = Pt.x;
      op1.Pt.y = Pt.y;
      if(use_xyz) op1.Pt.z = Pt.z;
      op1b = this.DupOutPt(op1, DiscardLeft);
    }
  }
  if(Dir2 === Direction.dLeftToRight) {
    while(op2.Next.Pt.x <= Pt.x && op2.Next.Pt.x >= op2.Pt.x && op2.Next.Pt.y === Pt.y)
      op2 = op2.Next;
    if(DiscardLeft && op2.Pt.x !== Pt.x) op2 = op2.Next;
    op2b = this.DupOutPt(op2, !DiscardLeft);
    if(FPoint.op_Inequality(op2b.Pt, Pt)) {
      op2 = op2b;
      //op2.Pt = Pt;
      op2.Pt.x = Pt.x;
      op2.Pt.y = Pt.y;
      if(use_xyz) op2.Pt.z = Pt.z;
      op2b = this.DupOutPt(op2, !DiscardLeft);
    }
  } else {
    while(op2.Next.Pt.x >= Pt.x && op2.Next.Pt.x <= op2.Pt.x && op2.Next.Pt.y === Pt.y)
      op2 = op2.Next;
    if(!DiscardLeft && op2.Pt.x !== Pt.x) op2 = op2.Next;
    op2b = this.DupOutPt(op2, DiscardLeft);
    if(FPoint.op_Inequality(op2b.Pt, Pt)) {
      op2 = op2b;
      //op2.Pt = Pt;
      op2.Pt.x = Pt.x;
      op2.Pt.y = Pt.y;
      if(use_xyz) op2.Pt.z = Pt.z;
      op2b = this.DupOutPt(op2, DiscardLeft);
    }
  }
  if((Dir1 === Direction.dLeftToRight) === DiscardLeft) {
    op1.Prev = op2;
    op2.Next = op1;
    op1b.Next = op2b;
    op2b.Prev = op1b;
  } else {
    op1.Next = op2;
    op2.Prev = op1;
    op1b.Prev = op2b;
    op2b.Next = op1b;
  }
  return true;
};

Clipper.prototype.JoinPoints = function(j, outRec1, outRec2) {
  var op1 = j.OutPt1,
    op1b = new OutPt();
  var op2 = j.OutPt2,
    op2b = new OutPt();
  //There are 3 kinds of joins for output polygons ...
  //1. Horizontal joins where Join.OutPt1 & Join.OutPt2 are vertices anywhere
  //along (horizontal) collinear edges (& Join.OffPt is on the same horizontal).
  //2. Non-horizontal joins where Join.OutPt1 & Join.OutPt2 are at the same
  //location at the Bottom of the overlapping segment (& Join.OffPt is above).
  //3. StrictlySimple joins where edges touch but are not collinear and where
  //Join.OutPt1, Join.OutPt2 & Join.OffPt all share the same point.
  var isHorizontal = j.OutPt1.Pt.y === j.OffPt.y;
  if(
    isHorizontal &&
    FPoint.op_Equality(j.OffPt, j.OutPt1.Pt) &&
    FPoint.op_Equality(j.OffPt, j.OutPt2.Pt)
  ) {
    //Strictly Simple join ...
    if(outRec1 !== outRec2) return false;

    op1b = j.OutPt1.Next;
    while(op1b !== op1 && FPoint.op_Equality(op1b.Pt, j.OffPt)) op1b = op1b.Next;
    var reverse1 = op1b.Pt.y > j.OffPt.y;
    op2b = j.OutPt2.Next;
    while(op2b !== op2 && FPoint.op_Equality(op2b.Pt, j.OffPt)) op2b = op2b.Next;
    var reverse2 = op2b.Pt.y > j.OffPt.y;
    if(reverse1 === reverse2) return false;
    if(reverse1) {
      op1b = this.DupOutPt(op1, false);
      op2b = this.DupOutPt(op2, true);
      op1.Prev = op2;
      op2.Next = op1;
      op1b.Next = op2b;
      op2b.Prev = op1b;
      j.OutPt1 = op1;
      j.OutPt2 = op1b;
      return true;
    } else {
      op1b = this.DupOutPt(op1, true);
      op2b = this.DupOutPt(op2, false);
      op1.Next = op2;
      op2.Prev = op1;
      op1b.Prev = op2b;
      op2b.Next = op1b;
      j.OutPt1 = op1;
      j.OutPt2 = op1b;
      return true;
    }
  } else if(isHorizontal) {
    //treat horizontal joins differently to non-horizontal joins since with
    //them we're not yet sure where the overlapping is. OutPt1.Pt & OutPt2.Pt
    //may be anywhere along the horizontal edge.
    op1b = op1;
    while(op1.Prev.Pt.y === op1.Pt.y && op1.Prev !== op1b && op1.Prev !== op2) op1 = op1.Prev;
    while(op1b.Next.Pt.y === op1b.Pt.y && op1b.Next !== op1 && op1b.Next !== op2) op1b = op1b.Next;
    if(op1b.Next === op1 || op1b.Next === op2) return false;
    //a flat 'polygon'
    op2b = op2;
    while(op2.Prev.Pt.y === op2.Pt.y && op2.Prev !== op2b && op2.Prev !== op1b) op2 = op2.Prev;
    while(op2b.Next.Pt.y === op2b.Pt.y && op2b.Next !== op2 && op2b.Next !== op1) op2b = op2b.Next;
    if(op2b.Next === op2 || op2b.Next === op1) return false;
    //a flat 'polygon'
    //Op1 -. Op1b & Op2 -. Op2b are the extremites of the horizontal edges

    var $val = {
      Left: null,
      Right: null
    };

    if(!this.GetOverlap(op1.Pt.x, op1b.Pt.x, op2.Pt.x, op2b.Pt.x, $val)) return false;
    var Left = $val.Left;
    var Right = $val.Right;

    //DiscardLeftSide: when overlapping edges are joined, a spike will created
    //which needs to be cleaned up. However, we don't want Op1 or Op2 caught up
    //on the discard Side as either may still be needed for other joins ...
    var Pt = new FPoint0();
    var DiscardLeftSide;
    if(op1.Pt.x >= Left && op1.Pt.x <= Right) {
      //Pt = op1.Pt;
      Pt.x = op1.Pt.x;
      Pt.y = op1.Pt.y;
      if(use_xyz) Pt.z = op1.Pt.z;
      DiscardLeftSide = op1.Pt.x > op1b.Pt.x;
    } else if(op2.Pt.x >= Left && op2.Pt.x <= Right) {
      //Pt = op2.Pt;
      Pt.x = op2.Pt.x;
      Pt.y = op2.Pt.y;
      if(use_xyz) Pt.z = op2.Pt.z;
      DiscardLeftSide = op2.Pt.x > op2b.Pt.x;
    } else if(op1b.Pt.x >= Left && op1b.Pt.x <= Right) {
      //Pt = op1b.Pt;
      Pt.x = op1b.Pt.x;
      Pt.y = op1b.Pt.y;
      if(use_xyz) Pt.z = op1b.Pt.z;
      DiscardLeftSide = op1b.Pt.x > op1.Pt.x;
    } else {
      //Pt = op2b.Pt;
      Pt.x = op2b.Pt.x;
      Pt.y = op2b.Pt.y;
      if(use_xyz) Pt.z = op2b.Pt.z;
      DiscardLeftSide = op2b.Pt.x > op2.Pt.x;
    }
    j.OutPt1 = op1;
    j.OutPt2 = op2;
    return this.JoinHorz(op1, op1b, op2, op2b, Pt, DiscardLeftSide);
  } else {
    //nb: For non-horizontal joins ...
    //    1. Jr.OutPt1.Pt.y == Jr.OutPt2.Pt.y
    //    2. Jr.OutPt1.Pt > Jr.OffPt.y
    //make sure the polygons are correctly oriented ...
    op1b = op1.Next;
    while(FPoint.op_Equality(op1b.Pt, op1.Pt) && op1b !== op1) op1b = op1b.Next;
    var Reverse1 = op1b.Pt.y > op1.Pt.y || !ClipperBase.SlopesEqual4(op1.Pt, op1b.Pt, j.OffPt);
    if(Reverse1) {
      op1b = op1.Prev;
      while(FPoint.op_Equality(op1b.Pt, op1.Pt) && op1b !== op1) op1b = op1b.Prev;

      if(op1b.Pt.y > op1.Pt.y || !ClipperBase.SlopesEqual4(op1.Pt, op1b.Pt, j.OffPt)) return false;
    }
    op2b = op2.Next;
    while(FPoint.op_Equality(op2b.Pt, op2.Pt) && op2b !== op2) op2b = op2b.Next;

    var Reverse2 = op2b.Pt.y > op2.Pt.y || !ClipperBase.SlopesEqual4(op2.Pt, op2b.Pt, j.OffPt);
    if(Reverse2) {
      op2b = op2.Prev;
      while(FPoint.op_Equality(op2b.Pt, op2.Pt) && op2b !== op2) op2b = op2b.Prev;

      if(op2b.Pt.y > op2.Pt.y || !ClipperBase.SlopesEqual4(op2.Pt, op2b.Pt, j.OffPt)) return false;
    }
    if(
      op1b === op1 ||
      op2b === op2 ||
      op1b === op2b ||
      (outRec1 === outRec2 && Reverse1 === Reverse2)
    )
      return false;
    if(Reverse1) {
      op1b = this.DupOutPt(op1, false);
      op2b = this.DupOutPt(op2, true);
      op1.Prev = op2;
      op2.Next = op1;
      op1b.Next = op2b;
      op2b.Prev = op1b;
      j.OutPt1 = op1;
      j.OutPt2 = op1b;
      return true;
    } else {
      op1b = this.DupOutPt(op1, true);
      op2b = this.DupOutPt(op2, false);
      op1.Next = op2;
      op2.Prev = op1;
      op1b.Prev = op2b;
      op2b.Next = op1b;
      j.OutPt1 = op1;
      j.OutPt2 = op1b;
      return true;
    }
  }
};

Clipper.GetBounds = function(paths) {
  var i = 0,
    cnt = paths.length;
  while(i < cnt && paths[i].length === 0) i++;
  if(i === cnt) return new FRect(0, 0, 0, 0);
  var result = new FRect();
  result.left = paths[i][0].x;
  result.right = result.left;
  result.top = paths[i][0].y;
  result.bottom = result.top;
  for(; i < cnt; i++)
    for(var j = 0, jlen = paths[i].length; j < jlen; j++) {
      if(paths[i][j].x < result.left) result.left = paths[i][j].x;
      else if(paths[i][j].x > result.right) result.right = paths[i][j].x;
      if(paths[i][j].y < result.top) result.top = paths[i][j].y;
      else if(paths[i][j].y > result.bottom) result.bottom = paths[i][j].y;
    }
  return result;
};
Clipper.prototype.GetBounds2 = function(ops) {
  var opStart = ops;
  var result = new FRect();
  result.left = ops.Pt.x;
  result.right = ops.Pt.x;
  result.top = ops.Pt.y;
  result.bottom = ops.Pt.y;
  ops = ops.Next;
  while(ops !== opStart) {
    if(ops.Pt.x < result.left) result.left = ops.Pt.x;
    if(ops.Pt.x > result.right) result.right = ops.Pt.x;
    if(ops.Pt.y < result.top) result.top = ops.Pt.y;
    if(ops.Pt.y > result.bottom) result.bottom = ops.Pt.y;
    ops = ops.Next;
  }
  return result;
};

Clipper.PointInPolygon = function(pt, path) {
  //returns 0 if false, +1 if true, -1 if pt ON polygon boundary
  //See "The Point in Polygon Problem for Arbitrary Polygons" by Hormann & Agathos
  //http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.88.5498&rep=rep1&type=pdf
  var result = 0,
    cnt = path.length;
  if(cnt < 3) return 0;
  var ip = path[0];
  for(var i = 1; i <= cnt; ++i) {
    var ipNext = i === cnt ? path[0] : path[i];
    if(ipNext.y === pt.y) {
      if(ipNext.x === pt.x || (ip.y === pt.y && ipNext.x > pt.x === ip.x < pt.x)) return -1;
    }
    if(ip.y < pt.y !== ipNext.y < pt.y) {
      if(ip.x >= pt.x) {
        if(ipNext.x > pt.x) result = 1 - result;
        else {
          var d = (ip.x - pt.x) * (ipNext.y - pt.y) - (ipNext.x - pt.x) * (ip.y - pt.y);
          if(d === 0) return -1;
          else if(d > 0 === ipNext.y > ip.y) result = 1 - result;
        }
      } else {
        if(ipNext.x > pt.x) {
          var d = (ip.x - pt.x) * (ipNext.y - pt.y) - (ipNext.x - pt.x) * (ip.y - pt.y);
          if(d === 0) return -1;
          else if(d > 0 === ipNext.y > ip.y) result = 1 - result;
        }
      }
    }
    ip = ipNext;
  }
  return result;
};

Clipper.prototype.PointInPolygon = function(pt, op) {
  //returns 0 if false, +1 if true, -1 if pt ON polygon boundary
  var result = 0;
  var startOp = op;
  var ptx = pt.x,
    pty = pt.y;
  var poly0x = op.Pt.x,
    poly0y = op.Pt.y;
  do {
    op = op.Next;
    var poly1x = op.Pt.x,
      poly1y = op.Pt.y;
    if(poly1y === pty) {
      if(poly1x === ptx || (poly0y === pty && poly1x > ptx === poly0x < ptx)) return -1;
    }
    if(poly0y < pty !== poly1y < pty) {
      if(poly0x >= ptx) {
        if(poly1x > ptx) result = 1 - result;
        else {
          var d = (poly0x - ptx) * (poly1y - pty) - (poly1x - ptx) * (poly0y - pty);
          if(d === 0) return -1;
          if(d > 0 === poly1y > poly0y) result = 1 - result;
        }
      } else {
        if(poly1x > ptx) {
          var d = (poly0x - ptx) * (poly1y - pty) - (poly1x - ptx) * (poly0y - pty);
          if(d === 0) return -1;
          if(d > 0 === poly1y > poly0y) result = 1 - result;
        }
      }
    }
    poly0x = poly1x;
    poly0y = poly1y;
  } while(startOp !== op);

  return result;
};

Clipper.prototype.Poly2ContainsPoly1 = function(outPt1, outPt2) {
  var op = outPt1;
  do {
    //nb: PointInPolygon returns 0 if false, +1 if true, -1 if pt on polygon
    var res = this.PointInPolygon(op.Pt, outPt2);
    if(res >= 0) return res > 0;
    op = op.Next;
  } while(op !== outPt1);
  return true;
};

Clipper.prototype.FixupFirstLefts1 = function(OldOutRec, NewOutRec) {
  var outRec, firstLeft;
  for(var i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++) {
    outRec = this.m_PolyOuts[i];
    firstLeft = Clipper.ParseFirstLeft(outRec.FirstLeft);
    if(outRec.Pts !== null && firstLeft === OldOutRec) {
      if(this.Poly2ContainsPoly1(outRec.Pts, NewOutRec.Pts)) outRec.FirstLeft = NewOutRec;
    }
  }
};

Clipper.prototype.FixupFirstLefts2 = function(innerOutRec, outerOutRec) {
  //A polygon has split into two such that one is now the inner of the other.
  //It's possible that these polygons now wrap around other polygons, so check
  //every polygon that's also contained by OuterOutRec's FirstLeft container
  //(including nil) to see if they've become inner to the new inner polygon ...
  var orfl = outerOutRec.FirstLeft;
  var outRec, firstLeft;
  for(var i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++) {
    outRec = this.m_PolyOuts[i];
    if(outRec.Pts === null || outRec === outerOutRec || outRec === innerOutRec) continue;
    firstLeft = Clipper.ParseFirstLeft(outRec.FirstLeft);
    if(firstLeft !== orfl && firstLeft !== innerOutRec && firstLeft !== outerOutRec) continue;
    if(this.Poly2ContainsPoly1(outRec.Pts, innerOutRec.Pts)) outRec.FirstLeft = innerOutRec;
    else if(this.Poly2ContainsPoly1(outRec.Pts, outerOutRec.Pts)) outRec.FirstLeft = outerOutRec;
    else if(outRec.FirstLeft === innerOutRec || outRec.FirstLeft === outerOutRec)
      outRec.FirstLeft = orfl;
  }
};

Clipper.prototype.FixupFirstLefts3 = function(OldOutRec, NewOutRec) {
  //same as FixupFirstLefts1 but doesn't call Poly2ContainsPoly1()
  var outRec;
  var firstLeft;
  for(var i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++) {
    outRec = this.m_PolyOuts[i];
    firstLeft = Clipper.ParseFirstLeft(outRec.FirstLeft);
    if(outRec.Pts !== null && firstLeft === OldOutRec) outRec.FirstLeft = NewOutRec;
  }
};

Clipper.ParseFirstLeft = function(FirstLeft) {
  while(FirstLeft !== null && FirstLeft.Pts === null) FirstLeft = FirstLeft.FirstLeft;
  return FirstLeft;
};

Clipper.prototype.JoinCommonEdges = function() {
  for(var i = 0, ilen = this.m_Joins.length; i < ilen; i++) {
    var join = this.m_Joins[i];
    var outRec1 = this.GetOutRec(join.OutPt1.Idx);
    var outRec2 = this.GetOutRec(join.OutPt2.Idx);
    if(outRec1.Pts === null || outRec2.Pts === null) continue;

    if(outRec1.IsOpen || outRec2.IsOpen) {
      continue;
    }

    //get the polygon fragment with the correct hole state (FirstLeft)
    //before calling JoinPoints() ...
    var holeStateRec;
    if(outRec1 === outRec2) holeStateRec = outRec1;
    else if(this.OutRec1RightOfOutRec2(outRec1, outRec2)) holeStateRec = outRec2;
    else if(this.OutRec1RightOfOutRec2(outRec2, outRec1)) holeStateRec = outRec1;
    else holeStateRec = this.GetLowermostRec(outRec1, outRec2);

    if(!this.JoinPoints(join, outRec1, outRec2)) continue;

    if(outRec1 === outRec2) {
      //instead of joining two polygons, we've just created a new one by
      //splitting one polygon into two.
      outRec1.Pts = join.OutPt1;
      outRec1.BottomPt = null;
      outRec2 = this.CreateOutRec();
      outRec2.Pts = join.OutPt2;
      //update all OutRec2.Pts Idx's ...
      this.UpdateOutPtIdxs(outRec2);

      if(this.Poly2ContainsPoly1(outRec2.Pts, outRec1.Pts)) {
        //outRec1 contains outRec2 ...
        outRec2.IsHole = !outRec1.IsHole;
        outRec2.FirstLeft = outRec1;
        if(this.m_UsingPolyTree) this.FixupFirstLefts2(outRec2, outRec1);
        if((outRec2.IsHole ^ this.ReverseSolution) == this.Area$1(outRec2) > 0)
          this.ReversePolyPtLinks(outRec2.Pts);
      } else if(this.Poly2ContainsPoly1(outRec1.Pts, outRec2.Pts)) {
        //outRec2 contains outRec1 ...
        outRec2.IsHole = outRec1.IsHole;
        outRec1.IsHole = !outRec2.IsHole;
        outRec2.FirstLeft = outRec1.FirstLeft;
        outRec1.FirstLeft = outRec2;
        if(this.m_UsingPolyTree) this.FixupFirstLefts2(outRec1, outRec2);

        if((outRec1.IsHole ^ this.ReverseSolution) == this.Area$1(outRec1) > 0)
          this.ReversePolyPtLinks(outRec1.Pts);
      } else {
        //the 2 polygons are completely separate ...
        outRec2.IsHole = outRec1.IsHole;
        outRec2.FirstLeft = outRec1.FirstLeft;
        //fixup FirstLeft pointers that may need reassigning to OutRec2
        if(this.m_UsingPolyTree) this.FixupFirstLefts1(outRec1, outRec2);
      }
    } else {
      //joined 2 polygons together ...
      outRec2.Pts = null;
      outRec2.BottomPt = null;
      outRec2.Idx = outRec1.Idx;
      outRec1.IsHole = holeStateRec.IsHole;
      if(holeStateRec === outRec2) outRec1.FirstLeft = outRec2.FirstLeft;
      outRec2.FirstLeft = outRec1;
      //fixup FirstLeft pointers that may need reassigning to OutRec1
      if(this.m_UsingPolyTree) this.FixupFirstLefts3(outRec2, outRec1);
    }
  }
};

Clipper.prototype.UpdateOutPtIdxs = function(outrec) {
  var op = outrec.Pts;
  do {
    op.Idx = outrec.Idx;
    op = op.Prev;
  } while(op !== outrec.Pts);
};

Clipper.prototype.DoSimplePolygons = function() {
  var i = 0;
  while(i < this.m_PolyOuts.length) {
    var outrec = this.m_PolyOuts[i++];
    var op = outrec.Pts;
    if(op === null || outrec.IsOpen) continue;
    do //for each Pt in Polygon until duplicate found do ...
    {
      var op2 = op.Next;
      while(op2 !== outrec.Pts) {
        if(FPoint.op_Equality(op.Pt, op2.Pt) && op2.Next !== op && op2.Prev !== op) {
          //split the polygon into two ...
          var op3 = op.Prev;
          var op4 = op2.Prev;
          op.Prev = op4;
          op4.Next = op;
          op2.Prev = op3;
          op3.Next = op2;
          outrec.Pts = op;
          var outrec2 = this.CreateOutRec();
          outrec2.Pts = op2;
          this.UpdateOutPtIdxs(outrec2);
          if(this.Poly2ContainsPoly1(outrec2.Pts, outrec.Pts)) {
            //OutRec2 is contained by OutRec1 ...
            outrec2.IsHole = !outrec.IsHole;
            outrec2.FirstLeft = outrec;
            if(this.m_UsingPolyTree) this.FixupFirstLefts2(outrec2, outrec);
          } else if(this.Poly2ContainsPoly1(outrec.Pts, outrec2.Pts)) {
            //OutRec1 is contained by OutRec2 ...
            outrec2.IsHole = outrec.IsHole;
            outrec.IsHole = !outrec2.IsHole;
            outrec2.FirstLeft = outrec.FirstLeft;
            outrec.FirstLeft = outrec2;
            if(this.m_UsingPolyTree) this.FixupFirstLefts2(outrec, outrec2);
          } else {
            //the 2 polygons are separate ...
            outrec2.IsHole = outrec.IsHole;
            outrec2.FirstLeft = outrec.FirstLeft;
            if(this.m_UsingPolyTree) this.FixupFirstLefts1(outrec, outrec2);
          }
          op2 = op;
          //ie get ready for the next iteration
        }
        op2 = op2.Next;
      }
      op = op.Next;
    } while(op !== outrec.Pts);
  }
};

Clipper.Area = function(poly) {
  if(!Array.isArray(poly)) return 0;
  var cnt = poly.length;
  if(cnt < 3) return 0;
  var a = 0;
  for(var i = 0, j = cnt - 1; i < cnt; ++i) {
    a += (poly[j].x + poly[i].x) * (poly[j].y - poly[i].y);
    j = i;
  }
  return -a * 0.5;
};

Clipper.prototype.Area = function(op) {
  var opFirst = op;
  if(op === null) return 0;
  var a = 0;
  do {
    a = a + (op.Prev.Pt.x + op.Pt.x) * (op.Prev.Pt.y - op.Pt.y);
    op = op.Next;
  } while(op !== opFirst); // && typeof op !== 'undefined');
  return a * 0.5;
};

Clipper.prototype.Area$1 = function(outRec) {
  return this.Area(outRec.Pts);
};

Clipper.SimplifyPolygon = function(poly, fillType) {
  var result = new Array();
  var c = new Clipper(0);
  c.StrictlySimple = true;
  c.AddPath(poly, PolyType.ptSubject, true);
  c.Execute(ClipType.ctUnion, result, fillType, fillType);
  return result;
};

Clipper.SimplifyPolygons = function(polys, fillType) {
  if(typeof fillType === 'undefined') fillType = PolyFillType.pftEvenOdd;
  var result = new Array();
  var c = new Clipper(0);
  c.StrictlySimple = true;
  c.AddPaths(polys, PolyType.ptSubject, true);
  c.Execute(ClipType.ctUnion, result, fillType, fillType);
  return result;
};

Clipper.DistanceSqrd = function(pt1, pt2) {
  var dx = pt1.x - pt2.x;
  var dy = pt1.y - pt2.y;
  return dx * dx + dy * dy;
};

Clipper.DistanceFromLineSqrd = function(pt, ln1, ln2) {
  //The equation of a line in general form (Ax + By + C = 0)
  //given 2 points (x¹,y¹) & (x²,y²) is ...
  //(y¹ - y²)x + (x² - x¹)y + (y² - y¹)x¹ - (x² - x¹)y¹ = 0
  //A = (y¹ - y²); B = (x² - x¹); C = (y² - y¹)x¹ - (x² - x¹)y¹
  //perpendicular distance of point (x³,y³) = (Ax³ + By³ + C)/Sqrt(A² + B²)
  //see http://en.wikipedia.org/wiki/Perpendicular_distance
  var A = ln1.y - ln2.y;
  var B = ln2.x - ln1.x;
  var C = A * ln1.x + B * ln1.y;
  C = A * pt.x + B * pt.y - C;
  return (C * C) / (A * A + B * B);
};

Clipper.SlopesNearCollinear = function(pt1, pt2, pt3, distSqrd) {
  //this function is more accurate when the point that's GEOMETRICALLY
  //between the other 2 points is the one that's tested for distance.
  //nb: with 'spikes', either pt1 or pt3 is geometrically between the other pts
  if(Math.abs(pt1.x - pt2.x) > Math.abs(pt1.y - pt2.y)) {
    if(pt1.x > pt2.x === pt1.x < pt3.x)
      return Clipper.DistanceFromLineSqrd(pt1, pt2, pt3) < distSqrd;
    else if(pt2.x > pt1.x === pt2.x < pt3.x)
      return Clipper.DistanceFromLineSqrd(pt2, pt1, pt3) < distSqrd;
    else return Clipper.DistanceFromLineSqrd(pt3, pt1, pt2) < distSqrd;
  } else {
    if(pt1.y > pt2.y === pt1.y < pt3.y)
      return Clipper.DistanceFromLineSqrd(pt1, pt2, pt3) < distSqrd;
    else if(pt2.y > pt1.y === pt2.y < pt3.y)
      return Clipper.DistanceFromLineSqrd(pt2, pt1, pt3) < distSqrd;
    else return Clipper.DistanceFromLineSqrd(pt3, pt1, pt2) < distSqrd;
  }
};

Clipper.PointsAreClose = function(pt1, pt2, distSqrd) {
  var dx = pt1.x - pt2.x;
  var dy = pt1.y - pt2.y;
  return dx * dx + dy * dy <= distSqrd;
};

Clipper.ExcludeOp = function(op) {
  var result = op.Prev;
  result.Next = op.Next;
  op.Next.Prev = result;
  result.Idx = 0;
  return result;
};

Clipper.CleanPolygon = function(path, distance) {
  if(typeof distance === 'undefined') distance = 1.415;
  //distance = proximity in units/pixels below which vertices will be stripped.
  //Default ~= sqrt(2) so when adjacent vertices or semi-adjacent vertices have
  //both x & y coords within 1 unit, then the second vertex will be stripped.
  var cnt = path.length;
  if(cnt === 0) return new Array();
  var outPts = new Array(cnt);
  for(var i = 0; i < cnt; ++i) outPts[i] = new OutPt();
  for(var i = 0; i < cnt; ++i) {
    outPts[i].Pt = path[i];
    outPts[i].Next = outPts[(i + 1) % cnt];
    outPts[i].Next.Prev = outPts[i];
    outPts[i].Idx = 0;
  }
  var distSqrd = distance * distance;
  var op = outPts[0];
  while(op.Idx === 0 && op.Next !== op.Prev) {
    if(Clipper.PointsAreClose(op.Pt, op.Prev.Pt, distSqrd)) {
      op = Clipper.ExcludeOp(op);
      cnt--;
    } else if(Clipper.PointsAreClose(op.Prev.Pt, op.Next.Pt, distSqrd)) {
      Clipper.ExcludeOp(op.Next);
      op = Clipper.ExcludeOp(op);
      cnt -= 2;
    } else if(Clipper.SlopesNearCollinear(op.Prev.Pt, op.Pt, op.Next.Pt, distSqrd)) {
      op = Clipper.ExcludeOp(op);
      cnt--;
    } else {
      op.Idx = 1;
      op = op.Next;
    }
  }
  if(cnt < 3) cnt = 0;
  var result = new Array(cnt);
  for(var i = 0; i < cnt; ++i) {
    result[i] = new FPoint1(op.Pt);
    op = op.Next;
  }
  outPts = null;
  return result;
};

Clipper.CleanPolygons = function(polys, distance) {
  var result = new Array(polys.length);
  for(var i = 0, ilen = polys.length; i < ilen; i++)
    result[i] = Clipper.CleanPolygon(polys[i], distance);
  return result;
};

Clipper.Minkowski = function(pattern, path, IsSum, IsClosed) {
  var delta = IsClosed ? 1 : 0;
  var polyCnt = pattern.length;
  var pathCnt = path.length;
  var result = new Array();
  if(IsSum)
    for(var i = 0; i < pathCnt; i++) {
      var p = new Array(polyCnt);
      for(var j = 0, jlen = pattern.length, ip = pattern[j]; j < jlen; j++, ip = pattern[j])
        p[j] = new FPoint2(path[i].x + ip.x, path[i].y + ip.y);
      result.push(p);
    }
  else
    for(var i = 0; i < pathCnt; i++) {
      var p = new Array(polyCnt);
      for(var j = 0, jlen = pattern.length, ip = pattern[j]; j < jlen; j++, ip = pattern[j])
        p[j] = new FPoint2(path[i].x - ip.x, path[i].y - ip.y);
      result.push(p);
    }
  var quads = new Array();
  for(var i = 0; i < pathCnt - 1 + delta; i++)
    for(var j = 0; j < polyCnt; j++) {
      var quad = new Array();
      quad.push(result[i % pathCnt][j % polyCnt]);
      quad.push(result[(i + 1) % pathCnt][j % polyCnt]);
      quad.push(result[(i + 1) % pathCnt][(j + 1) % polyCnt]);
      quad.push(result[i % pathCnt][(j + 1) % polyCnt]);
      if(!Clipper.Orientation(quad)) quad.reverse();
      quads.push(quad);
    }
  return quads;
};

Clipper.MinkowskiSum = function(pattern, path_or_paths, pathIsClosed) {
  if(!(path_or_paths[0] instanceof Array)) {
    var path = path_or_paths;
    var paths = Clipper.Minkowski(pattern, path, true, pathIsClosed);
    var c = new Clipper();
    c.AddPaths(paths, PolyType.ptSubject, true);
    c.Execute(ClipType.ctUnion, paths, PolyFillType.pftNonZero, PolyFillType.pftNonZero);
    return paths;
  } else {
    var paths = path_or_paths;
    var solution = new Paths();
    var c = new Clipper();
    for(var i = 0; i < paths.length; ++i) {
      var tmp = Clipper.Minkowski(pattern, paths[i], true, pathIsClosed);
      c.AddPaths(tmp, PolyType.ptSubject, true);
      if(pathIsClosed) {
        var path = Clipper.TranslatePath(paths[i], pattern[0]);
        c.AddPath(path, PolyType.ptClip, true);
      }
    }
    c.Execute(ClipType.ctUnion, solution, PolyFillType.pftNonZero, PolyFillType.pftNonZero);
    return solution;
  }
};

Clipper.TranslatePath = function(path, delta) {
  var outPath = new Path();
  for(var i = 0; i < path.length; i++)
    outPath.push(new FPoint2(path[i].x + delta.x, path[i].y + delta.y));
  return outPath;
};

Clipper.MinkowskiDiff = function(poly1, poly2) {
  var paths = Clipper.Minkowski(poly1, poly2, false, true);
  var c = new Clipper();
  c.AddPaths(paths, PolyType.ptSubject, true);
  c.Execute(ClipType.ctUnion, paths, PolyFillType.pftNonZero, PolyFillType.pftNonZero);
  return paths;
};

Clipper.PolyTreeToPaths = function(polytree) {
  var result = new Array();
  //result.set_Capacity(polytree.get_Total());
  Clipper.AddPolyNodeToPaths(polytree, Clipper.NodeType.ntAny, result);
  return result;
};

Clipper.AddPolyNodeToPaths = function(polynode, nt, paths) {
  var match = true;
  switch (nt) {
    case Clipper.NodeType.ntOpen:
      return;
    case Clipper.NodeType.ntClosed:
      match = !polynode.IsOpen;
      break;
    default:
      break;
  }
  if(polynode.m_polygon.length > 0 && match) paths.push(polynode.m_polygon);
  for(
    var $i3 = 0, $t3 = polynode.Childs(), $l3 = $t3.length, pn = $t3[$i3];
    $i3 < $l3;
    $i3++, pn = $t3[$i3]
  )
    Clipper.AddPolyNodeToPaths(pn, nt, paths);
};

Clipper.OpenPathsFromPolyTree = function(polytree) {
  var result = new Paths();
  //result.set_Capacity(polytree.ChildCount());
  for(var i = 0, ilen = polytree.ChildCount(); i < ilen; i++)
    if(polytree.Childs()[i].IsOpen) result.push(polytree.Childs()[i].m_polygon);
  return result;
};

Clipper.ClosedPathsFromPolyTree = function(polytree) {
  var result = new Paths();
  //result.set_Capacity(polytree.Total());
  Clipper.AddPolyNodeToPaths(polytree, Clipper.NodeType.ntClosed, result);
  return result;
};

Inherit(Clipper, ClipperBase);
Clipper.NodeType = {
  ntAny: 0,
  ntOpen: 1,
  ntClosed: 2
};

/**
 * @constructor
 */
export const ClipperOffset = (ClipperLib.ClipperOffset = function(miterLimit, arcTolerance) {
  if(typeof miterLimit === 'undefined') miterLimit = 2;
  if(typeof arcTolerance === 'undefined') arcTolerance = ClipperOffset.def_arc_tolerance;
  this.m_destPolys = new Paths();
  this.m_srcPoly = new Path();
  this.m_destPoly = new Path();
  this.m_normals = new Array();
  this.m_delta = 0;
  this.m_sinA = 0;
  this.m_sin = 0;
  this.m_cos = 0;
  this.m_miterLim = 0;
  this.m_StepsPerRad = 0;
  this.m_lowest = new FPoint0();
  this.m_polyNodes = new PolyNode();
  this.MiterLimit = miterLimit;
  this.ArcTolerance = arcTolerance;
  this.m_lowest.x = -1;
});

ClipperOffset.two_pi = 6.28318530717959;
ClipperOffset.def_arc_tolerance = 0.25;
ClipperOffset.prototype.Clear = function() {
  Clear(this.m_polyNodes.Childs());
  this.m_lowest.x = -1;
};

ClipperOffset.prototype.AddPath = function(path, joinType, endType) {
  var highI = path.length - 1;
  if(highI < 0) return;
  var newNode = new PolyNode();
  newNode.m_jointype = joinType;
  newNode.m_endtype = endType;
  //strip duplicate points from path and also get index to the lowest point ...
  if(endType === EndType.etClosedLine || endType === EndType.etClosedPolygon)
    while(highI > 0 && FPoint.op_Equality(path[0], path[highI])) highI--;
  //newNode.m_polygon.set_Capacity(highI + 1);
  newNode.m_polygon.push(path[0]);
  var j = 0,
    k = 0;
  for(var i = 1; i <= highI; i++)
    if(FPoint.op_Inequality(newNode.m_polygon[j], path[i])) {
      j++;
      newNode.m_polygon.push(path[i]);
      if(
        path[i].y > newNode.m_polygon[k].y ||
        (path[i].y === newNode.m_polygon[k].y && path[i].x < newNode.m_polygon[k].x)
      )
        k = j;
    }
  if(endType === EndType.etClosedPolygon && j < 2) return;

  this.m_polyNodes.AddChild(newNode);
  //if this path's lowest pt is lower than all the others then update m_lowest
  if(endType !== EndType.etClosedPolygon) return;
  if(this.m_lowest.x < 0) this.m_lowest = new FPoint2(this.m_polyNodes.ChildCount() - 1, k);
  else {
    var ip = this.m_polyNodes.Childs()[this.m_lowest.x].m_polygon[this.m_lowest.y];
    if(
      newNode.m_polygon[k].y > ip.y ||
      (newNode.m_polygon[k].y === ip.y && newNode.m_polygon[k].x < ip.x)
    )
      this.m_lowest = new FPoint2(this.m_polyNodes.ChildCount() - 1, k);
  }
};

ClipperOffset.prototype.AddPaths = function(paths, joinType, endType) {
  for(var i = 0, ilen = paths.length; i < ilen; i++) this.AddPath(paths[i], joinType, endType);
};

ClipperOffset.prototype.FixOrientations = function() {
  //fixup orientations of all closed paths if the orientation of the
  //closed path with the lowermost vertex is wrong ...
  if(
    this.m_lowest.x >= 0 &&
    !Clipper.Orientation(this.m_polyNodes.Childs()[this.m_lowest.x].m_polygon)
  ) {
    for(var i = 0; i < this.m_polyNodes.ChildCount(); i++) {
      var node = this.m_polyNodes.Childs()[i];
      if(
        node.m_endtype === EndType.etClosedPolygon ||
        (node.m_endtype === EndType.etClosedLine && Clipper.Orientation(node.m_polygon))
      )
        node.m_polygon.reverse();
    }
  } else {
    for(var i = 0; i < this.m_polyNodes.ChildCount(); i++) {
      var node = this.m_polyNodes.Childs()[i];
      if(node.m_endtype === EndType.etClosedLine && !Clipper.Orientation(node.m_polygon))
        node.m_polygon.reverse();
    }
  }
};

ClipperOffset.GetUnitNormal = function(pt1, pt2) {
  var dx = pt2.x - pt1.x;
  var dy = pt2.y - pt1.y;
  if(dx === 0 && dy === 0) return new FPoint2(0, 0);
  var f = 1 / Math.sqrt(dx * dx + dy * dy);
  dx *= f;
  dy *= f;
  return new FPoint2(dy, -dx);
};

ClipperOffset.prototype.DoOffset = function(delta) {
  this.m_destPolys = new Array();
  this.m_delta = delta;
  //if Zero offset, just copy any CLOSED polygons to m_p and return ...
  if(ClipperBase.near_zero(delta)) {
    //this.m_destPolys.set_Capacity(this.m_polyNodes.ChildCount);
    for(var i = 0; i < this.m_polyNodes.ChildCount(); i++) {
      var node = this.m_polyNodes.Childs()[i];
      if(node.m_endtype === EndType.etClosedPolygon) this.m_destPolys.push(node.m_polygon);
    }
    return;
  }
  //see offset_triginometry3.svg in the documentation folder ...
  if(this.MiterLimit > 2) this.m_miterLim = 2 / (this.MiterLimit * this.MiterLimit);
  else this.m_miterLim = 0.5;
  var ay;
  if(this.ArcTolerance <= 0) ay = ClipperOffset.def_arc_tolerance;
  else if(this.ArcTolerance > Math.abs(delta) * ClipperOffset.def_arc_tolerance)
    ay = Math.abs(delta) * ClipperOffset.def_arc_tolerance;
  else ay = this.ArcTolerance;
  //see offset_triginometry2.svg in the documentation folder ...
  var steps = 3.14159265358979 / Math.acos(1 - ay / Math.abs(delta));
  this.m_sin = Math.sin(ClipperOffset.two_pi / steps);
  this.m_cos = Math.cos(ClipperOffset.two_pi / steps);
  this.m_StepsPerRad = steps / ClipperOffset.two_pi;
  if(delta < 0) this.m_sin = -this.m_sin;
  //this.m_destPolys.set_Capacity(this.m_polyNodes.ChildCount * 2);
  for(var i = 0; i < this.m_polyNodes.ChildCount(); i++) {
    var node = this.m_polyNodes.Childs()[i];
    this.m_srcPoly = node.m_polygon;
    var len = this.m_srcPoly.length;
    if(len === 0 || (delta <= 0 && (len < 3 || node.m_endtype !== EndType.etClosedPolygon)))
      continue;
    this.m_destPoly = new Array();
    if(len === 1) {
      if(node.m_jointype === JoinType.jtRound) {
        var x = 1,
          y = 0;
        for(var j = 1; j <= steps; j++) {
          this.m_destPoly.push(
            new FPoint2(this.m_srcPoly[0].x + x * delta, this.m_srcPoly[0].y + y * delta)
          );
          var X2 = x;
          x = x * this.m_cos - this.m_sin * y;
          y = X2 * this.m_sin + y * this.m_cos;
        }
      } else {
        var x = -1,
          y = -1;
        for(var j = 0; j < 4; ++j) {
          this.m_destPoly.push(
            new FPoint2(this.m_srcPoly[0].x + x * delta, this.m_srcPoly[0].y + y * delta)
          );
          if(x < 0) x = 1;
          else if(y < 0) y = 1;
          else x = -1;
        }
      }
      this.m_destPolys.push(this.m_destPoly);
      continue;
    }
    //build m_normals ...
    this.m_normals.length = 0;
    //this.m_normals.set_Capacity(len);
    for(var j = 0; j < len - 1; j++)
      this.m_normals.push(ClipperOffset.GetUnitNormal(this.m_srcPoly[j], this.m_srcPoly[j + 1]));
    if(node.m_endtype === EndType.etClosedLine || node.m_endtype === EndType.etClosedPolygon)
      this.m_normals.push(ClipperOffset.GetUnitNormal(this.m_srcPoly[len - 1], this.m_srcPoly[0]));
    else this.m_normals.push(new FPoint1(this.m_normals[len - 2]));
    if(node.m_endtype === EndType.etClosedPolygon) {
      var k = len - 1;
      for(var j = 0; j < len; j++) k = this.OffsetPoint(j, k, node.m_jointype);
      this.m_destPolys.push(this.m_destPoly);
    } else if(node.m_endtype === EndType.etClosedLine) {
      var k = len - 1;
      for(var j = 0; j < len; j++) k = this.OffsetPoint(j, k, node.m_jointype);
      this.m_destPolys.push(this.m_destPoly);
      this.m_destPoly = new Array();
      //re-build m_normals ...
      var n = this.m_normals[len - 1];
      for(var j = len - 1; j > 0; j--)
        this.m_normals[j] = new FPoint2(-this.m_normals[j - 1].x, -this.m_normals[j - 1].y);
      this.m_normals[0] = new FPoint2(-n.x, -n.y);
      k = 0;
      for(var j = len - 1; j >= 0; j--) k = this.OffsetPoint(j, k, node.m_jointype);
      this.m_destPolys.push(this.m_destPoly);
    } else {
      var k = 0;
      for(var j = 1; j < len - 1; ++j) k = this.OffsetPoint(j, k, node.m_jointype);
      var pt1;
      if(node.m_endtype === EndType.etOpenButt) {
        var j = len - 1;
        pt1 = new FPoint2(
          this.m_srcPoly[j].x + this.m_normals[j].x * delta,
          this.m_srcPoly[j].y + this.m_normals[j].y * delta
        );
        this.m_destPoly.push(pt1);
        pt1 = new FPoint2(
          this.m_srcPoly[j].x - this.m_normals[j].x * delta,
          this.m_srcPoly[j].y - this.m_normals[j].y * delta
        );
        this.m_destPoly.push(pt1);
      } else {
        var j = len - 1;
        k = len - 2;
        this.m_sinA = 0;
        this.m_normals[j] = new FPoint2(-this.m_normals[j].x, -this.m_normals[j].y);
        if(node.m_endtype === EndType.etOpenSquare) this.DoSquare(j, k);
        else this.DoRound(j, k);
      }
      //re-build m_normals ...
      for(var j = len - 1; j > 0; j--)
        this.m_normals[j] = new FPoint2(-this.m_normals[j - 1].x, -this.m_normals[j - 1].y);
      this.m_normals[0] = new FPoint2(-this.m_normals[1].x, -this.m_normals[1].y);
      k = len - 1;
      for(var j = k - 1; j > 0; --j) k = this.OffsetPoint(j, k, node.m_jointype);
      if(node.m_endtype === EndType.etOpenButt) {
        pt1 = new FPoint2(
          this.m_srcPoly[0].x - this.m_normals[0].x * delta,
          this.m_srcPoly[0].y - this.m_normals[0].y * delta
        );
        this.m_destPoly.push(pt1);
        pt1 = new FPoint2(
          this.m_srcPoly[0].x + this.m_normals[0].x * delta,
          this.m_srcPoly[0].y + this.m_normals[0].y * delta
        );
        this.m_destPoly.push(pt1);
      } else {
        k = 1;
        this.m_sinA = 0;
        if(node.m_endtype === EndType.etOpenSquare) this.DoSquare(0, 1);
        else this.DoRound(0, 1);
      }
      this.m_destPolys.push(this.m_destPoly);
    }
  }
};

ClipperOffset.prototype.Execute = function(...a) {
  var  ispolytree = a[0] instanceof PolyTree;
  if(!ispolytree) {
    // function (solution, delta)
    var solution = a[0],
      delta = a[1];
    Clear(solution);
    this.FixOrientations();
    this.DoOffset(delta);
    //now clean up 'corners' ...
    var clpr = new Clipper(0);
    clpr.AddPaths(this.m_destPolys, PolyType.ptSubject, true);
    if(delta > 0) {
      clpr.Execute(ClipType.ctUnion, solution, PolyFillType.pftPositive, PolyFillType.pftPositive);
    } else {
      var r = Clipper.GetBounds(this.m_destPolys);
      var outer = new Path();
      outer.push(new FPoint2(r.left - 10, r.bottom + 10));
      outer.push(new FPoint2(r.right + 10, r.bottom + 10));
      outer.push(new FPoint2(r.right + 10, r.top - 10));
      outer.push(new FPoint2(r.left - 10, r.top - 10));
      clpr.AddPath(outer, PolyType.ptSubject, true);
      clpr.ReverseSolution = true;
      clpr.Execute(ClipType.ctUnion, solution, PolyFillType.pftNegative, PolyFillType.pftNegative);
      if(solution.length > 0) solution.splice(0, 1);
    }
    //console.log(JSON.stringify(solution));
  } // function (polytree, delta)
  else {
    var solution = a[0],
      delta = a[1];
    solution.Clear();
    this.FixOrientations();
    this.DoOffset(delta);
    //now clean up 'corners' ...
    var clpr = new Clipper(0);
    clpr.AddPaths(this.m_destPolys, PolyType.ptSubject, true);
    if(delta > 0) {
      clpr.Execute(ClipType.ctUnion, solution, PolyFillType.pftPositive, PolyFillType.pftPositive);
    } else {
      var r = Clipper.GetBounds(this.m_destPolys);
      var outer = new Path();
      outer.push(new FPoint2(r.left - 10, r.bottom + 10));
      outer.push(new FPoint2(r.right + 10, r.bottom + 10));
      outer.push(new FPoint2(r.right + 10, r.top - 10));
      outer.push(new FPoint2(r.left - 10, r.top - 10));
      clpr.AddPath(outer, PolyType.ptSubject, true);
      clpr.ReverseSolution = true;
      clpr.Execute(ClipType.ctUnion, solution, PolyFillType.pftNegative, PolyFillType.pftNegative);
      //remove the outer PolyNode rectangle ...
      if(solution.ChildCount() === 1 && solution.Childs()[0].ChildCount() > 0) {
        var outerNode = solution.Childs()[0];
        //solution.Childs.set_Capacity(outerNode.ChildCount);
        solution.Childs()[0] = outerNode.Childs()[0];
        solution.Childs()[0].m_Parent = solution;
        for(var i = 1; i < outerNode.ChildCount(); i++) solution.AddChild(outerNode.Childs()[i]);
      } else solution.Clear();
    }
  }
};

ClipperOffset.prototype.OffsetPoint = function(j, k, jointype) {
  //cross product ...
  this.m_sinA =
    this.m_normals[k].x * this.m_normals[j].y - this.m_normals[j].x * this.m_normals[k].y;

  if(this.m_sinA === 0) {
    return k;
  } else if(this.m_sinA > 1) this.m_sinA = 1.0;
  /*
		else if(this.m_sinA < 0.00005 && this.m_sinA > -0.00005)
{
			console.log(this.m_sinA);
      return k;
}
*/
  /*
	 if(Math.abs(this.m_sinA * this.m_delta) < 1.0)
		{
			//dot product ...
			var cosA = (this.m_normals[k].x * this.m_normals[j].x + this.m_normals[j].y * this.m_normals[k].y);
		 if(cosA > 0) // angle ==> 0 degrees
			{
				this.m_destPoly.push(new FPoint2(this.m_srcPoly[j].x + this.m_normals[k].x * this.m_delta, this.m_srcPoly[j].y + this.m_normals[k].y * this.m_delta));
				return k;
			}
			//else angle ==> 180 degrees
		}
*/ else if(
    this.m_sinA < -1
  )
    this.m_sinA = -1.0;
  if(this.m_sinA * this.m_delta < 0) {
    this.m_destPoly.push(
      new FPoint2(
        this.m_srcPoly[j].x + this.m_normals[k].x * this.m_delta,
        this.m_srcPoly[j].y + this.m_normals[k].y * this.m_delta
      )
    );
    this.m_destPoly.push(new FPoint1(this.m_srcPoly[j]));
    this.m_destPoly.push(
      new FPoint2(
        this.m_srcPoly[j].x + this.m_normals[j].x * this.m_delta,
        this.m_srcPoly[j].y + this.m_normals[j].y * this.m_delta
      )
    );
  } else
    switch (jointype) {
      case JoinType.jtMiter: {
        var r =
          1 +
          (this.m_normals[j].x * this.m_normals[k].x + this.m_normals[j].y * this.m_normals[k].y);
        if(r >= this.m_miterLim) this.DoMiter(j, k, r);
        else this.DoSquare(j, k);
        break;
      }
      case JoinType.jtSquare:
        this.DoSquare(j, k);
        break;
      case JoinType.jtRound:
        this.DoRound(j, k);
        break;
    }
  k = j;
  return k;
};

ClipperOffset.prototype.DoSquare = function(j, k) {
  var dx = Math.tan(
    Math.atan2(
      this.m_sinA,
      this.m_normals[k].x * this.m_normals[j].x + this.m_normals[k].y * this.m_normals[j].y
    ) / 4
  );
  this.m_destPoly.push(
    new FPoint2(
      this.m_srcPoly[j].x + this.m_delta * (this.m_normals[k].x - this.m_normals[k].y * dx),
      this.m_srcPoly[j].y + this.m_delta * (this.m_normals[k].y + this.m_normals[k].x * dx)
    )
  );
  this.m_destPoly.push(
    new FPoint2(
      this.m_srcPoly[j].x + this.m_delta * (this.m_normals[j].x + this.m_normals[j].y * dx),
      this.m_srcPoly[j].y + this.m_delta * (this.m_normals[j].y - this.m_normals[j].x * dx)
    )
  );
};

ClipperOffset.prototype.DoMiter = function(j, k, r) {
  var q = this.m_delta / r;
  this.m_destPoly.push(
    new FPoint2(
      this.m_srcPoly[j].x + (this.m_normals[k].x + this.m_normals[j].x) * q,
      this.m_srcPoly[j].y + (this.m_normals[k].y + this.m_normals[j].y) * q
    )
  );
};

ClipperOffset.prototype.DoRound = function(j, k) {
  var a = Math.atan2(
    this.m_sinA,
    this.m_normals[k].x * this.m_normals[j].x + this.m_normals[k].y * this.m_normals[j].y
  );

  var steps = Math.max(Math.round(this.m_StepsPerRad * Math.abs(a)), 1);

  var x = this.m_normals[k].x,
    y = this.m_normals[k].y,
    X2;
  for(var i = 0; i < steps; ++i) {
    this.m_destPoly.push(
      new FPoint2(this.m_srcPoly[j].x + x * this.m_delta, this.m_srcPoly[j].y + y * this.m_delta)
    );
    X2 = x;
    x = x * this.m_cos - this.m_sin * y;
    y = X2 * this.m_sin + y * this.m_cos;
  }
  this.m_destPoly.push(
    new FPoint2(
      this.m_srcPoly[j].x + this.m_normals[j].x * this.m_delta,
      this.m_srcPoly[j].y + this.m_normals[j].y * this.m_delta
    )
  );
};

(ClipperLib.Error = function(message) {
 // try {
    throw new Error(message);
  /*} catch(err) {
    throw err; //(err.message);
  }*/
});

// ---------------------------------------------

// JS extension by Timo 2013
export const JS = (ClipperLib.JS = {});

JS.AreaOfPolygon = function(poly) {
  return Clipper.Area(poly);
};

JS.AreaOfPolygons = function(poly) {
  var area = 0;
  for(var i = 0; i < poly.length; i++) {
    area += Clipper.Area(poly[i]);
  }
  return area;
};

JS.BoundsOfPath = function(path) {
  return JS.BoundsOfPaths([path]);
};

JS.BoundsOfPaths = function(paths) {
  var bounds = Clipper.GetBounds(paths);
  return bounds;
};

// Clean() joins vertices that are too near each other
// and causes distortion to offsetted polygons without cleaning
JS.Clean = function(polygon, delta) {
  if(!(polygon instanceof Array)) return [];
  var isPolygons = polygon[0] instanceof Array;
  var polygon = JS.Clone(polygon);
  if(typeof delta !== 'number' || delta === null) {
    ClipperLib.Error('Delta is not a number in Clean().');
    return polygon;
  }
  if(polygon.length === 0 || (polygon.length === 1 && polygon[0].length === 0) || delta < 0)
    return polygon;
  if(!isPolygons) polygon = [polygon];
  var k_length = polygon.length;
  var len, poly, result, d, p, j, i;
  var results = [];
  for(var k = 0; k < k_length; k++) {
    poly = polygon[k];
    len = poly.length;
    if(len === 0) continue;
    else if(len < 3) {
      result = poly;
      results.push(result);
      continue;
    }
    result = poly;
    d = delta * delta;
    //d = Math.floor(c_delta * c_delta);
    p = poly[0];
    j = 1;
    for(i = 1; i < len; i++) {
      if((poly[i].x - p.x) * (poly[i].x - p.x) + (poly[i].y - p.y) * (poly[i].y - p.y) <= d)
        continue;
      result[j] = poly[i];
      p = poly[i];
      j++;
    }
    p = poly[j - 1];
    if((poly[0].x - p.x) * (poly[0].x - p.x) + (poly[0].y - p.y) * (poly[0].y - p.y) <= d) j--;
    if(j < len) result.splice(j, len - j);
    if(result.length) results.push(result);
  }
  if(!isPolygons && results.length) results = results[0];
  else if(!isPolygons && results.length === 0) results = [];
  else if(isPolygons && results.length === 0) results = [[]];
  return results;
};
// Make deep copy of Polygons or Polygon
// so that also FPoint objects are cloned and not only referenced
// This should be the fastest way
JS.Clone = function(polygon) {
  if(!(polygon instanceof Array)) return [];
  if(polygon.length === 0) return [];
  else if(polygon.length === 1 && polygon[0].length === 0) return [[]];
  var isPolygons = polygon[0] instanceof Array;
  if(!isPolygons) polygon = [polygon];
  var len = polygon.length,
    plen,
    i,
    j,
    result;
  var results = new Array(len);
  for(i = 0; i < len; i++) {
    plen = polygon[i].length;
    result = new Array(plen);
    for(j = 0; j < plen; j++) {
      result[j] = {
        x: polygon[i][j].x,
        y: polygon[i][j].y
      };
    }
    results[i] = result;
  }
  if(!isPolygons) results = results[0];
  return results;
};

// Removes points that doesn't affect much to the visual appearance.
// If middle point is at or under certain distance (tolerance) of the line segment between
// start and end point, the middle point is removed.
JS.Lighten = function(polygon, tolerance) {
  if(!(polygon instanceof Array)) return [];
  if(typeof tolerance !== 'number' || tolerance === null) {
    ClipperLib.Error('Tolerance is not a number in Lighten().');
    return JS.Clone(polygon);
  }
  if(polygon.length === 0 || (polygon.length === 1 && polygon[0].length === 0) || tolerance < 0) {
    return JS.Clone(polygon);
  }
  var isPolygons = polygon[0] instanceof Array;
  if(!isPolygons) polygon = [polygon];
  var i, j, poly, k, poly2, plen, A, B, P, d, rem, addlast;
  var bxax, byay, l, ax, ay;
  var len = polygon.length;
  var toleranceSq = tolerance * tolerance;
  var results = [];
  for(i = 0; i < len; i++) {
    poly = polygon[i];
    plen = poly.length;
    if(plen === 0) continue;
    for(
      k = 0;
      k < 1000000;
      k++ // could be forever loop, but wiser to restrict max repeat count
    ) {
      poly2 = [];
      plen = poly.length;
      // the first have to added to the end, if first and last are not the same
      // this way we ensure that also the actual last point can be removed if needed
      if(poly[plen - 1].x !== poly[0].x || poly[plen - 1].y !== poly[0].y) {
        addlast = 1;
        poly.push({
          x: poly[0].x,
          y: poly[0].y
        });
        plen = poly.length;
      } else addlast = 0;
      rem = []; // Indexes of removed points
      for(j = 0; j < plen - 2; j++) {
        A = poly[j]; // Start point of line segment
        P = poly[j + 1]; // Middle point. This is the one to be removed.
        B = poly[j + 2]; // End point of line segment
        ax = A.x;
        ay = A.y;
        bxax = B.x - ax;
        byay = B.y - ay;
        if(bxax !== 0 || byay !== 0) {
          // To avoid Nan, when A==P && P==B. And to avoid peaks (A==B && A!=P), which have lenght, but not area.
          l = ((P.x - ax) * bxax + (P.y - ay) * byay) / (bxax * bxax + byay * byay);
          if(l > 1) {
            ax = B.x;
            ay = B.y;
          } else if(l > 0) {
            ax += bxax * l;
            ay += byay * l;
          }
        }
        bxax = P.x - ax;
        byay = P.y - ay;
        d = bxax * bxax + byay * byay;
        if(d <= toleranceSq) {
          rem[j + 1] = 1;
          j++; // when removed, transfer the pointer to the next one
        }
      }
      // add all unremoved points to poly2
      poly2.push({
        x: poly[0].x,
        y: poly[0].y
      });
      for(j = 1; j < plen - 1; j++)
        if(!rem[j])
          poly2.push({
            x: poly[j].x,
            y: poly[j].y
          });
      poly2.push({
        x: poly[plen - 1].x,
        y: poly[plen - 1].y
      });
      // if the first point was added to the end, remove it
      if(addlast) poly.pop();
      // break, if there was not anymore removed points
      if(!rem.length) break;
      // else continue looping using poly2, to check if there are points to remove
      else poly = poly2;
    }
    plen = poly2.length;
    // remove duplicate from end, if needed
    if(poly2[plen - 1].x === poly2[0].x && poly2[plen - 1].y === poly2[0].y) {
      poly2.pop();
    }
    if(poly2.length > 2)
      // to avoid two-point-polygons
      results.push(poly2);
  }
  if(!isPolygons) {
    results = results[0];
  }
  if(typeof results === 'undefined') {
    results = [];
  }
  return results;
};

JS.PerimeterOfPath = function(path, closed) {
  if(typeof path === 'undefined') return 0;
  var sqrt = Math.sqrt;
  var perimeter = 0.0;
  var p1,
    p2,
    p1x = 0.0,
    p1y = 0.0,
    p2x = 0.0,
    p2y = 0.0;
  var j = path.length;
  if(j < 2) return 0;
  if(closed) {
    path[j] = path[0];
    j++;
  }
  while(--j) {
    p1 = path[j];
    p1x = p1.x;
    p1y = p1.y;
    p2 = path[j - 1];
    p2x = p2.x;
    p2y = p2.y;
    perimeter += sqrt((p1x - p2x) * (p1x - p2x) + (p1y - p2y) * (p1y - p2y));
  }
  if(closed) path.pop();
  return perimeter;
};

JS.PerimeterOfPaths = function(paths, closed) {
  var perimeter = 0;
  for(var i = 0; i < paths.length; i++) {
    perimeter += JS.PerimeterOfPath(paths[i], closed);
  }
  return perimeter;
};

/**
 * @constructor
 */
export const ExPolygons = (ClipperLib.ExPolygons = function() {
  return [];
});
/**
 * @constructor
 */
export const ExPolygon = (ClipperLib.ExPolygon = function() {
  this.outer = null;
  this.holes = null;
});

JS.AddOuterPolyNodeToExPolygons = function(polynode, expolygons) {
  var ep = new ExPolygon();
  ep.outer = polynode.Contour();
  var childs = polynode.Childs();
  var ilen = childs.length;
  ep.holes = new Array(ilen);
  var node, n, i, j, childs2, jlen;
  for(i = 0; i < ilen; i++) {
    node = childs[i];
    ep.holes[i] = node.Contour();
    //Add outer polygons contained by (nested within) holes ...
    for(j = 0, childs2 = node.Childs(), jlen = childs2.length; j < jlen; j++) {
      n = childs2[j];
      JS.AddOuterPolyNodeToExPolygons(n, expolygons);
    }
  }
  expolygons.push(ep);
};

JS.ExPolygonsToPaths = function(expolygons) {
  var a, i, alen, ilen;
  var paths = new Paths();
  for(a = 0, alen = expolygons.length; a < alen; a++) {
    paths.push(expolygons[a].outer);
    for(i = 0, ilen = expolygons[a].holes.length; i < ilen; i++) {
      paths.push(expolygons[a].holes[i]);
    }
  }
  return paths;
};
JS.PolyTreeToExPolygons = function(polytree) {
  var expolygons = new ExPolygons();
  var node, i, childs, ilen;
  for(i = 0, childs = polytree.Childs(), ilen = childs.length; i < ilen; i++) {
    node = childs[i];
    JS.AddOuterPolyNodeToExPolygons(node, expolygons);
  }
  return expolygons;
};

export default ClipperLib; // { ...ClipperLib, version, use_lines, use_xyz, Path, Paths, PolyNode, PolyTree, PI, PI2, FPoint, FRect, FRect0, FRect1, FRect4, ClipType, PolyType, PolyFillType, JoinType, EndType, EdgeSide, Direction, TEdge, IntersectNode, MyIntersectNodeSort, LocalMinima, Scanbeam, Maxima, OutRec, OutPt, Join, ClipperBase, Clipper, Error, JS, ExPolygons, ExPolygon };
