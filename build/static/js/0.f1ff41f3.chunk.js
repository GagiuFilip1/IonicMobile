(this.webpackJsonpmyApp=this.webpackJsonpmyApp||[]).push([[0],{180:function(t,e,n){"use strict";n.r(e),n.d(e,"createSwipeBackGesture",(function(){return i}));var r=n(18),a=(n(35),n(50)),i=function(t,e,n,i,c){var o=t.ownerDocument.defaultView;return Object(a.createGesture)({el:t,gestureName:"goback-swipe",gesturePriority:40,threshold:10,canStart:function(t){return t.startX<=50&&e()},onStart:n,onMove:function(t){var e=t.deltaX/o.innerWidth;i(e)},onEnd:function(t){var e=t.deltaX,n=o.innerWidth,a=e/n,i=t.velocityX,u=n/2,s=i>=0&&(i>.2||t.deltaX>u),p=(s?1-a:a)*n,h=0;if(p>5){var d=p/Math.abs(i);h=Math.min(d,540)}c(s,a<=0?.01:Object(r.h)(0,a,.9999),h)}})}}}]);
//# sourceMappingURL=0.f1ff41f3.chunk.js.map