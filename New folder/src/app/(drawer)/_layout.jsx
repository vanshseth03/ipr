import React from 'react';
import { Drawer } from 'expo-router/drawer';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useNavigation } from 'expo-router';
import {
  MessageSquare,
  History as HistoryIcon,
  Settings,
  Leaf,
  Plus,
  PanelLeft,
} from 'lucide-react-native';

import { useChatStore } from '../../store/chatStore';
import { useLanguagePref } from '../../hooks/useLanguagePref';
import { t } from '../../constants/config';
import { colors, spacing, radii, shadow } from '../../constants/theme';

const WIDE_BREAKPOINT = 768;

function DrawerIcon(Icon) {
  return ({ color, size }) => <Icon color={color} size={size ?? 18} strokeWidth={2} />;
}

function CustomHeaderLeft() {
  const navigation = useNavigation();

  const handleToggle = () => {
    if (typeof navigation.toggleDrawer === 'function') {
      navigation.toggleDrawer();
    } else {
      navigation.dispatch({ type: 'TOGGLE_DRAWER' });
    }
  };

  return (
    <Pressable
      onPress={handleToggle}
      style={({ pressed }) => [
        styles.headerToggleBtn,
        pressed && styles.headerToggleBtnPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Toggle navigation sidebar"
      hitSlop={8}
    >
      <PanelLeft size={20} color={colors.navTextActive} strokeWidth={2.2} />
    </Pressable>
  );
}

function DrawerHeader() {
  const newConversation = useChatStore((s) => s.newConversation);
  const { language } = useLanguagePref();
  const navigation = useNavigation();

  const handleNewChat = () => {
    newConversation();
    if (Platform.OS !== 'web') {
      if (typeof navigation.closeDrawer === 'function') {
        navigation.closeDrawer();
      }
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.brandRow}>
        <View style={styles.brandIcon}>
          <Leaf color={colors.accent} size={18} strokeWidth={2.5} />
        </View>
        <View>
          <Text style={styles.brandText}>{t('brandTitle', language)}</Text>
          <Text style={styles.brandVersion}>{t('edition', language)}</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.newChatBtn, pressed && styles.newChatBtnPressed]}
        onPress={handleNewChat}
        accessibilityRole="button"
        accessibilityLabel="Start new conversation"
      >
        <Plus size={15} color={colors.textOnBrand} strokeWidth={2.5} />
        <Text style={styles.newChatText}>{t('newConversation', language)}</Text>
      </Pressable>
    </View>
  );
}

export default function DrawerLayout() {
  const { width } = useWindowDimensions();
  const { language } = useLanguagePref();
  const isWide = width >= WIDE_BREAKPOINT;

  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerLeft: () => <CustomHeaderLeft />,
        headerTitle: () => (
          <View style={styles.headerTitleRow}>
            <Leaf color={colors.accent} size={17} strokeWidth={2.5} />
            <Text style={styles.headerTitleText}>{t('appName', language)}</Text>
          </View>
        ),
        headerStyle: styles.navHeader,
        headerTintColor: colors.navTextActive,
        drawerType: isWide ? 'slide' : 'front',
        drawerStyle: [styles.drawer, isWide && styles.drawerDesktop],
        overlayColor: isWide ? 'transparent' : 'rgba(5, 15, 10, 0.65)',
        drawerActiveTintColor: colors.navTextActive,
        drawerInactiveTintColor: colors.navTextInactive,
        drawerActiveBackgroundColor: colors.navSurface,
        drawerLabelStyle: styles.drawerLabel,
        drawerItemStyle: styles.drawerItem,
        sceneContainerStyle: { backgroundColor: colors.bg },
      }}
      drawerContent={(props) => (
        <View style={styles.drawerContentWrap}>
          <DrawerHeader />
          <View style={styles.drawerItemsWrap}>
            {props.state.routes.map((route, index) => {
              const { options } = props.descriptors[route.key];
              const isFocused = props.state.index === index;
              const IconComponent = options.drawerIcon;

              let label = options.title || route.name;
              if (route.name === 'chat') label = t('chatNav', language);
              if (route.name === 'history') label = t('historyNav', language);
              if (route.name === 'settings') label = t('settingsNav', language);

              return (
                <Pressable
                  key={route.key}
                  onPress={() => {
                    props.navigation.navigate(route.name);
                    if (width < WIDE_BREAKPOINT && typeof props.navigation.closeDrawer === 'function') {
                      props.navigation.closeDrawer();
                    }
                  }}
                  style={({ pressed }) => [
                    styles.drawerItemCustom,
                    isFocused && styles.drawerItemFocused,
                    pressed && styles.drawerItemPressed,
                  ]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isFocused }}
                >
                  {isFocused && <View style={styles.activeIndicator} />}
                  {IconComponent && (
                    <IconComponent
                      color={isFocused ? colors.accent : colors.navTextInactive}
                      size={19}
                    />
                  )}
                  <Text
                    style={[
                      styles.drawerLabelCustom,
                      isFocused && styles.drawerLabelFocused,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Clean minimal footer */}
          <View style={styles.drawerFooter}>
            <View style={styles.footerBrandRow}>
              <Leaf size={13} color={colors.accent} strokeWidth={2} />
              <Text style={styles.footerBrandText}>{t('footerBrand', language)}</Text>
            </View>
          </View>
        </View>
      )}
    >
      <Drawer.Screen
        name="chat"
        options={{ title: t('chatNav', language), drawerIcon: DrawerIcon(MessageSquare) }}
      />
      <Drawer.Screen
        name="history"
        options={{ title: t('historyNav', language), drawerIcon: DrawerIcon(HistoryIcon) }}
      />
      <Drawer.Screen
        name="settings"
        options={{ title: t('settingsNav', language), drawerIcon: DrawerIcon(Settings) }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  navHeader: {
    backgroundColor: colors.navBg,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.navBorder,
  },
  headerToggleBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    borderRadius: radii.md,
  },
  headerToggleBtnPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navTextActive,
    letterSpacing: -0.3,
  },
  drawer: {
    backgroundColor: colors.navBg,
    width: 270,
  },
  drawerDesktop: {
    borderRightWidth: 1,
    borderRightColor: colors.navBorder,
    ...shadow.md,
  },
  drawerContentWrap: {
    flex: 1,
    backgroundColor: colors.navBg,
  },
  headerContainer: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.navBorder,
    gap: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: colors.navSurface,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navTextActive,
    letterSpacing: -0.3,
  },
  brandVersion: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 1,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
    borderWidth: 1,
    borderColor: colors.brandLight,
    ...shadow.sm,
  },
  newChatBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  newChatText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textOnBrand,
  },
  drawerItemsWrap: {
    flex: 1,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: 3,
  },
  drawerItemCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    position: 'relative',
  },
  drawerItemFocused: {
    backgroundColor: colors.navSurface,
  },
  drawerItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  drawerLabelCustom: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.navTextInactive,
  },
  drawerLabelFocused: {
    fontWeight: '700',
    color: colors.navTextActive,
  },
  drawerLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  drawerItem: {
    borderRadius: radii.md,
    marginHorizontal: spacing.sm,
  },
  drawerFooter: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.navBorder,
    alignItems: 'center',
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerBrandText: {
    fontSize: 11,
    color: colors.navTextInactive,
    fontWeight: '500',
  },
});
