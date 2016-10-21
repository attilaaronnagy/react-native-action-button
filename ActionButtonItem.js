import React, { Component, PropTypes } from 'react';
import { StyleSheet, Text, View, Animated, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const alignItemsMap = {
  center: 'center',
  left: 'flex-start',
  right: 'flex-end'
};

const styles = StyleSheet.create({
  actionButtonWrap: {
    width
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  shadow: {
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 0, height: 0,
    },
    shadowColor: '#666',
    shadowRadius: 1,
    elevation: 6,
  },
  actionTextView: {
    position: 'absolute',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  actionText: {
    flex: 1,
    fontSize: 14,
  }
});

export default class RenderActionButtonItem extends Component {

  constructor(props) {
    super(props);
    this.state = {
      spaceBetween: 15,
      alignItems: alignItemsMap[this.props.position]
    };

    if (!props.children || Array.isArray(props.children)) {
      throw new Error('ActionButtonItem must have a Child component.');
    }
  }

  getTextStyles() {
    // to align the center of the label with the center of the button,
    // offset = (half the size of the btn) - (half the size of the label)
    const offsetTop = this.props.size >= 28 ? (this.props.size / 2) - 14 : 0;

    let positionStyles = {
      right: this.props.size + this.state.spaceBetween,
      top: offsetTop
    };

    let bgStyle = { backgroundColor: 'white' };

    if (this.props.titleBgColor) {
      bgStyle = {
        backgroundColor: this.props.titleBgColor
      };
    }

    if (this.props.position === 'left') {
      positionStyles = {
        left: this.props.size + this.state.spaceBetween,
        top: offsetTop
      };
    }

    if (this.props.position === 'center') {
      positionStyles = {
        right: (this.props.size / 2) + (width / 2) + this.state.spaceBetween,
        top: offsetTop
      };
    }

    return [styles.actionTextView, positionStyles, bgStyle];
  }

  render() {
    const translateXMap = {
      center: 0,
      left: (this.props.parentSize - this.props.size) / 2,
      right: -(this.props.parentSize - this.props.size) / 2,
    };

    const margin = (this.props.spacing < 12) ? 0 : (this.props.spacing - 12);

    const style = (this.props.anim !== undefined) ? [
      styles.actionButtonWrap, {
        alignItems: this.state.alignItems,
        marginBottom: this.props.verticalOrientation === 'up' ? margin : 0,
        marginTop: this.props.verticalOrientation === 'down' ? margin : 0,
        opacity: this.props.anim,
        transform: [
          {
            translateX: translateXMap[this.props.position]
          },
          {
            translateY: this.props.anim.interpolate({
              inputRange: [0, 1],
              outputRange: [this.props.verticalOrientation === 'down' ? -40 : 40, 0]
            })
          }
        ]
      }
    ] : [];

    return (
      <Animated.View
        pointerEvents="box-none"
        style={style}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={this.props.activeOpacity || 0.85}
          onPress={this.props.onPress}
        >
          <View
            style={[styles.actionButton, !this.props.hideShadow && styles.shadow, this.props.style, {
              width: this.props.size,
              height: this.props.size,
              borderRadius: this.props.size / 2,
              backgroundColor: this.props.buttonColor || this.props.btnColor,
              marginBottom: this.props.verticalOrientation === 'up' ? 12 : 0,
              marginTop: this.props.verticalOrientation === 'down' ? 12 : 0,
            }]}
          >
            {this.props.children}
          </View>
        </TouchableOpacity>
        {this.props.title && (
          <TouchableOpacity
            style={[this.getTextStyles(), this.props.textContainerStyle, !this.props.hideShadow && styles.shadow]}
            activeOpacity={this.props.activeOpacity || 0.85}
            onPress={this.props.onPress}
          >
            <Text style={[styles.actionText, this.props.textStyle, { color: this.props.titleColor || '#444' }]}>
              {this.props.title}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  }
}

RenderActionButtonItem.propTypes = {
  anim: PropTypes.object,
  parentSize: PropTypes.number,
  spacing: PropTypes.number,
  btnColor: PropTypes.string,
  verticalOrientation: PropTypes.string,
  hideShadow: PropTypes.bool,
  activeOpacity: PropTypes.number,
  position: PropTypes.string,
  size: PropTypes.number,
  children: PropTypes.element,
  style: PropTypes.object,

  title: PropTypes.string,
  onPress: PropTypes.func,
  buttonColor: PropTypes.string,
  titleColor: PropTypes.string,
  titleBgColor: PropTypes.string,
  textContainerStyle: PropTypes.object,
  textStyle: PropTypes.object,
};
