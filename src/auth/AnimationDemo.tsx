import React, { useEffect } from 'react';
import { createAnimation } from '@ionic/react';
import './AnimationDemo.css';

const AnimationDemo = (props: { allMandatory: any, usernameMandatory: any,passwordMandatory: any  }) => {
    useEffect(simpleAnimation, [props.allMandatory]);
    //useEffect(groupAnimations, [props.allMandatory]);
    useEffect(chainAnimations, [props.usernameMandatory]);

    return (<div className="container">
      <div className="square-a">
          <p>{props.allMandatory}</p>
      </div>
      <div className="square-b">
          <p>{props.usernameMandatory}</p>
      </div>
      <div className="square-c">
          <p>{props.passwordMandatory}</p>
      </div>
    </div>);

  function simpleAnimation() {
    const el = document.querySelector('.square-a');
    if (el) {
      const animation = createAnimation()
        .addElement(el)
        .duration(1000)
        .direction('alternate')
        .iterations(Infinity)
        .keyframes([
          { offset: 0, transform: 'scale(1.5)', opacity: '1' },
          {
            offset: 1, transform: 'scale(0.5)', opacity: '0.5'
          }
        ]);
      animation.play();
    }
  }

    function groupAnimations() {
        const elB = document.querySelector('.square-b');
        const elC = document.querySelector('.square-c');
        if (elB && elC) {
            const animationA = createAnimation()
                .addElement(elB)
                .duration(1000)
                .fromTo('transform', 'scale(0.5)', 'scale(1.5)');
            const animationB = createAnimation()
                .addElement(elC)
                .duration(1000)
                .fromTo('transform', 'scale(1.5)', 'scale(0.5)');
            const parentAnimation = createAnimation()
                .direction('alternate')
                .iterations(Infinity)
                .addAnimation([animationA, animationB]);
            parentAnimation.play();    }
    }


    function chainAnimations() {
        const elB = document.querySelector('.square-b');
        const elC = document.querySelector('.square-c');
        if (elB && elC) {
            const animationA = createAnimation()
                .addElement(elB)
                .duration(5000)
                .fromTo('transform', 'scale(1)', 'scale(1.5)')
                .afterStyles({
                    'color': 'red'
                });
            const animationB = createAnimation()
                .addElement(elC)
                .duration(7000)
                .fromTo('transform', 'scale(1)', 'scale(0.5)')
                .afterStyles({
                    'color': 'red'
                });
            (async () => {
                await animationA.play();
                await animationB.play();
            })();
        }
    }
};

export default AnimationDemo;
