import React, { Component, PropTypes, createElement } from 'react';
import { StyleSheet, View, Animated, TouchableOpacity } from 'react-native';
import RenderActionButtonItem from './ActionButtonItem';

const alignItemsMap = {
  center: 'center',
  left: 'flex-start',
  right: 'flex-end'
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  actionBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    marginTop: -4,
    fontSize: 24,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  btnShadow: {
    shadowOpacity: 0.5,
    shadowOffset: {
      width: 0, height: 0,
    },
    shadowColor: '#666',
    shadowRadius: 1,
    elevation: 6,
  },
  actionsVertical: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});


export class ActionButtonItem extends Component {
  render() {
    return (
      <View>
        {this.props.children}
      </View>
    );
  }
}

ActionButtonItem.propTypes = {
  children: PropTypes.element,
};


const shadowHeight = 12;

export class ActionButton extends Component {

  constructor(props) {
    super(props);

    this.state = {
      active: props.active,
    };

    this.anim = new Animated.Value(props.active ? 1 : 0);
    this.timeout = null;
    this._renderActions = this._renderActions.bind(this);
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }


  //
  // STYLESHEET GETTERS
  //

  getContainerStyles() {
    return [styles.overlay, this.getOrientation(), this.getOffsetXY()];
  }

  getActionButtonStyles() {
    return [styles.actionBarItem, this.getButtonSize()];
  }

  getOrientation() {
    return { alignItems: alignItemsMap[this.props.position] };
  }

  getButtonSize() {
    return {
      width: this.props.size,
      height: this.props.size + shadowHeight,
    };
  }

  getOffsetXY() {
    return {
      paddingHorizontal: this.props.offsetX,
      paddingBottom: this.props.offsetY
    };
  }

  getActionsStyle() {
    return [
      styles.actionsVertical,
      this.getOrientation(),
      {
        flexDirection: this.props.verticalOrientation === 'down' ?
          'column-reverse' :
          'column',
      },
    ];
  }


  //
  // RENDER METHODS
  //

  _renderButton() {
    const buttonColorMax = this.props.btnOutRange ? this.props.btnOutRange : this.props.buttonColor;

    const animatedViewStyle = [
      styles.btn, {
        width: this.props.size,
        height: this.props.size,
        borderRadius: this.props.size / 2,
        backgroundColor: this.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [this.props.buttonColor, buttonColorMax]
        }),
        transform: [
          {
            scale: this.anim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, this.props.outRangeScale]
            })
          }, {
            rotate: this.anim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', `${this.props.degrees}deg`]
            })
          }
        ]
      }
    ];

    if (!this.props.hideShadow) {
      animatedViewStyle.push(styles.btnShadow);
    }

    return (
      <View style={this.getActionButtonStyles()}>
        <TouchableOpacity
          activeOpacity={0.85}
          onLongPress={this.props.onLongPress}
          onPress={() => {
            this.props.onPress();
            if (this.props.children) {
              this.animateButton();
            }
          }}
        >
          <Animated.View style={animatedViewStyle}>
            {this._renderButtonIcon()}
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  }

  _renderButtonIcon() {
    const { icon, btnOutRangeTxt, buttonTextColor } = this.props;
    if (icon) {
      return icon;
    }
    const buttonTextColorMax = (btnOutRangeTxt !== undefined) ? btnOutRangeTxt : buttonTextColor;

    return (
      <Animated.Text
        style={[styles.btnText, {
          color: this.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [buttonTextColor, buttonTextColorMax]
          })
        }]}
      >
        +
      </Animated.Text>
    );
  }

  _renderActions() {
    if (!this.state.active) return null;
    const actionButtons = (!Array.isArray(this.props.children)) ? [this.props.children] : this.props.children;

    return (
      <View
        style={this.getActionsStyle()}
        pointerEvents={'box-none'}
      >
        {actionButtons.map((Item, index) => {
          return createElement(RenderActionButtonItem, {
            key: index,
            anim: this.anim,
            ...this.props,
            parentSize: this.props.size,
            btnColor: this.props.btnOutRange,
            ...Item.props,
            onPress: () => {
              if (this.props.autoInactive) {
                this.timeout = setTimeout(this.reset.bind(this), 200);
              }
              Item.props.onPress();
            }
          });
        })}
      </View>
    );
  }

  _renderTappableBackground() {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlay}
        onPress={this.reset.bind(this)}
      />
    );
  }


  //
  // Animation Methods
  //

  animateButton(animate = true) {
    if (this.state.active) {
      this.reset();
    }

    if (animate) {
      Animated.spring(this.anim, { toValue: 1 }).start();
    } else {
      this.anim.setValue(1);
    }

    this.setState({ active: true });
  }

  reset(animate = true) {
    if (this.props.onReset) {
      this.props.onReset();
    }

    if (animate) {
      Animated.spring(this.anim, { toValue: 0 }).start();
    } else {
      this.anim.setValue(0);
    }

    setTimeout(() => this.setState({ active: false }), 250);
  }

  render() {
    return (
      <View pointerEvents="box-none" style={styles.overlay}>
        <Animated.View
          pointerEvents="none"
          style={[styles.overlay, {
            backgroundColor: this.props.bgColor,
            opacity: this.anim
          }]}
        >
          {this.props.backdrop}
        </Animated.View>
        <View pointerEvents="box-none" style={this.getContainerStyles()}>
          {(this.state.active && !this.props.backgroundTappable) && this._renderTappableBackground()}

          {(this.props.verticalOrientation === 'up' && this.props.children) ? this._renderActions() : null}
          {this._renderButton()}
          {(this.props.verticalOrientation === 'down' && this.props.children) ? this._renderActions() : null}

        </View>
      </View>
    );
  }
}

ActionButton.propTypes = {
  active: PropTypes.bool,

  position: PropTypes.string,

  hideShadow: PropTypes.bool,

  bgColor: PropTypes.string,
  buttonColor: PropTypes.string,
  buttonTextColor: PropTypes.string,

  offsetX: PropTypes.number,
  offsetY: PropTypes.number,


  onReset: PropTypes.func,
  icon: PropTypes.element,
  onLongPress: PropTypes.func,
  outRangeScale: PropTypes.number,
  btnOutRange: PropTypes.string,
  btnOutRangeTxt: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.array
  ]),,


  size: PropTypes.number,
  autoInactive: PropTypes.bool,
  onPress: PropTypes.func,
  backdrop: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  degrees: PropTypes.number,
  verticalOrientation: PropTypes.oneOf(['up', 'down']),
  backgroundTappable: PropTypes.bool,
};

ActionButton.defaultProps = {
  active: false,
  bgColor: 'transparent',
  buttonColor: 'rgba(0,0,0,1)',
  buttonTextColor: 'rgba(255,255,255,1)',
  spacing: 20,
  outRangeScale: 1,
  autoInactive: true,
  onPress: () => {},
  backdrop: false,
  degrees: 135,
  position: 'right',
  offsetX: 30,
  offsetY: 30,
  size: 56,
  verticalOrientation: 'up',
  backgroundTappable: false,
};
