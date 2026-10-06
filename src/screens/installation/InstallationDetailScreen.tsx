import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { MapPin, Building2, Package, IndianRupee, Camera, Wrench, CheckCircle2, Hash, User, Phone, Workflow, Ruler } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeService } from '../../services/storeService';
import Toast from 'react-native-toast-message';
import imageService from '../../services/imageService';
import {
  Card, StatusBadge, Button, EmptyState,
  SectionTitle, StatStrip, Timeline, PhotoTile, PhotoStrip, ImageViewer,
  FactGrid, ContactCard, LocationCard, SpecsCard, CommercialCard,
  tone, alpha,
} from '../../components/ui';

interface InstallationDetailProps {
  route: {
    params: {
      storeId: string;
    };
  };
  navigation: {
    goBack: () => void;
    navigate?: (screen: string, params?: any) => void;
  };
}

const APPROVAL_COLOR: Record<string, string> = {
  APPROVED: tone.success,
  REJECTED: tone.danger,
};

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : undefined);

// The API stores each installation image under `installationPhoto`
// (store.model.ts → installation.photos[].installationPhoto). The old screen
// read `.photo`, which never exists, so installation photos never showed.
const installationImage = (p: any): string | undefined => p?.installationPhoto || p?.photo || undefined;

export default function InstallationDetailScreen({ route, navigation }: InstallationDetailProps) {
  const { theme } = useTheme();
  const { storeId } = route.params;
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchStoreDetails();
  }, []);

  const fetchStoreDetails = async () => {
    try {
      setLoading(true);
      const response = await storeService.getById(storeId);
      setStore(response.store);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load store details'
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const c = theme.colors;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center', gap: 10 }}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={{ color: c.textSecondary, fontSize: 13 }}>Loading installation details…</Text>
      </View>
    );
  }

  if (!store) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center' }}>
        <EmptyState title="Store not found" message="It may have been deleted or you no longer have access." />
      </View>
    );
  }

  const img = (path?: string) => (path ? imageService.getFullImageUrl(path) : undefined);
  const reccePhotos: any[] = store.recce?.reccePhotos || [];
  const initialPhotos: string[] = store.recce?.initialPhotos || [];
  const installPhotos: any[] = store.installation?.photos || [];
  const approvedBoards = reccePhotos.filter((p: any) => p.approvalStatus === 'APPROVED').length;
  const rejectedBoards = reccePhotos.filter((p: any) => p.approvalStatus === 'REJECTED').length;
  const mobile = store.contact?.mobile || store.contact?.phone || store.mobile || store.phone || store.contactMobile || store.dealerMobile;
  const locationLine = [store.location?.city, store.location?.district, store.location?.state].filter(Boolean).join(', ');

  // Group installation photos by board, only for approved recce boards (same rule as before).
  const boardsWithInstallPhotos = Object.entries(
    installPhotos.reduce((acc: Record<number, any[]>, p: any) => {
      const idx = p.reccePhotoIndex;
      const recce = reccePhotos[idx];
      if (!recce || recce.approvalStatus !== 'APPROVED') return acc;
      (acc[idx] = acc[idx] || []).push(p);
      return acc;
    }, {}),
  ).map(([idx, photos]) => ({ index: Number(idx), recce: reccePhotos[Number(idx)], photos: photos as any[] }))
    .sort((a, b) => a.index - b.index);

  const status = store.currentStatus;
  const installDone = status === 'INSTALLATION_SUBMITTED' || status === 'COMPLETED';
  const canStart = status === 'INSTALLATION_ASSIGNED' && !!navigation.navigate;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: canStart ? 100 : 32 }}>
        {/* ---------- Hero ---------- */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <View style={[styles.heroIcon, { backgroundColor: alpha(tone.success, 0.14) }]}>
              <Wrench size={22} color={tone.success} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ color: c.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }}>{store.storeId || store.dealerCode}</Text>
              <Text style={{ color: c.text, fontSize: 20, fontWeight: '900' }}>{store.storeName}</Text>
              {!!locationLine && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} color={c.textSecondary} />
                  <Text style={{ color: c.textSecondary, fontSize: 12, flex: 1 }} numberOfLines={1}>{locationLine}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={{ marginTop: 12 }}>
            <StatusBadge status={status} />
          </View>
          <StatStrip
            items={[
              { label: 'Boards', value: reccePhotos.length },
              { label: 'Approved', value: approvedBoards, color: tone.success },
              { label: 'Installed', value: boardsWithInstallPhotos.length, color: tone.info },
              { label: 'Photos', value: installPhotos.length },
            ]}
          />
        </Card>

        {/* ---------- Workflow ---------- */}
        <Card>
          <SectionTitle icon={<Workflow size={16} color={c.textSecondary} />} title="Progress" />
          <Timeline
            steps={[
              {
                title: 'Recce completed',
                subtitle: store.workflow?.recceAssignedTo?.name ? `by ${store.workflow.recceAssignedTo.name}` : 'Recce user not recorded',
                meta: fmtDate(store.workflow?.recceSubmittedAt),
                done: true,
              },
              {
                title: 'Installation assigned',
                subtitle: store.workflow?.installationAssignedTo?.name ? `to ${store.workflow.installationAssignedTo.name}` : 'Not assigned yet',
                meta: fmtDate(store.workflow?.installationAssignedAt),
                done: !!store.workflow?.installationAssignedTo,
                active: !store.workflow?.installationAssignedTo,
              },
              {
                title: 'Installation submitted',
                subtitle: installDone ? `${installPhotos.length} photo${installPhotos.length === 1 ? '' : 's'} uploaded` : 'Waiting for installer',
                meta: fmtDate(store.workflow?.installationSubmittedAt),
                done: installDone,
                active: status === 'INSTALLATION_ASSIGNED',
              },
              {
                title: 'Completed',
                subtitle: status === 'COMPLETED' ? 'Installation approved' : 'Pending review',
                done: status === 'COMPLETED',
                active: status === 'INSTALLATION_SUBMITTED',
              },
            ]}
          />
        </Card>

        {/* ---------- Contact ---------- */}
        <ContactCard name={store.contact?.personName} mobile={mobile} />

        {/* ---------- Identifiers ---------- */}
        <FactGrid
          items={[
            { label: 'Store ID', value: store.storeId },
            { label: 'Client code', value: store.clientCode },
            { label: 'Dealer code', value: store.dealerCode },
            { label: 'Vendor code', value: store.vendorCode },
          ]}
        />

        {/* ---------- Location ---------- */}
        <LocationCard location={store.location} />

        {/* ---------- Specs + commercial ---------- */}
        <SpecsCard specs={store.specs} />
        <CommercialCard commercials={store.commercials} />

        {/* ---------- Recce reference ---------- */}
        {(initialPhotos.length > 0 || reccePhotos.length > 0) && (
          <Card>
            <SectionTitle
              icon={<Camera size={16} color={c.textSecondary} />}
              title="Recce reference"
              right={
                <Text style={{ color: c.textSecondary, fontSize: 11 }}>
                  <Text style={{ color: tone.success, fontWeight: '800' }}>{approvedBoards} approved</Text>
                  {rejectedBoards ? <Text style={{ color: tone.danger, fontWeight: '800' }}>  {rejectedBoards} rejected</Text> : null}
                </Text>
              }
            />
            {initialPhotos.length > 0 && (
              <View style={{ marginBottom: reccePhotos.length ? 14 : 0 }}>
                <Text style={styles.subLabel(c)}>STORE PHOTOS</Text>
                <PhotoStrip>
                  {initialPhotos.map((photo: string, index: number) => (
                    <PhotoTile key={index} uri={img(photo)} size={84} onPress={() => setSelectedImage(img(photo) || null)} />
                  ))}
                </PhotoStrip>
              </View>
            )}
            {reccePhotos.length > 0 && (
              <View>
                <Text style={styles.subLabel(c)}>BOARDS</Text>
                <PhotoStrip>
                  {reccePhotos.map((rp: any, index: number) => (
                    <PhotoTile
                      key={index}
                      uri={img(rp.photo)}
                      size={84}
                      label={`B${index + 1}`}
                      caption={rp.measurements ? `${rp.measurements.width}×${rp.measurements.height} ${rp.measurements.unit || ''}` : undefined}
                      statusColor={APPROVAL_COLOR[rp.approvalStatus] || tone.warning}
                      onPress={() => setSelectedImage(img(rp.photo) || null)}
                    />
                  ))}
                </PhotoStrip>
              </View>
            )}
          </Card>
        )}

        {/* ---------- Installation photos, per board ---------- */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 2, marginTop: 2 }}>
          <Wrench size={16} color={c.textSecondary} />
          <Text style={{ color: c.text, fontSize: 16, fontWeight: '900', flex: 1 }}>
            Installation photos <Text style={{ color: c.textSecondary, fontWeight: '700' }}>({installPhotos.length})</Text>
          </Text>
        </View>

        {boardsWithInstallPhotos.length === 0 ? (
          <Card>
            <EmptyState
              title="No installation photos yet"
              message="Photos will appear here once the installer submits the installation."
              icon={<Camera size={28} color={c.textTertiary} />}
            />
          </Card>
        ) : boardsWithInstallPhotos.map(({ index, recce, photos }) => (
          <Card key={index}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <View style={[styles.boardChip, { backgroundColor: c.surfaceSecondary }]}>
                <Text style={{ color: c.text, fontSize: 12, fontWeight: '900' }}>Board {index + 1}</Text>
              </View>
              {recce?.measurements && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ruler size={12} color={c.textSecondary} />
                  <Text style={{ color: c.textSecondary, fontSize: 12 }}>{recce.measurements.width} × {recce.measurements.height} {recce.measurements.unit}</Text>
                </View>
              )}
              <View style={{ flex: 1 }} />
              <StatusBadge label="Installed" color={tone.success} size="sm" />
            </View>

            {recce?.elements?.[0]?.elementName ? (
              <Text style={{ color: c.textSecondary, fontSize: 12, marginBottom: 10 }}>
                Element <Text style={{ color: c.text, fontWeight: '800' }}>{recce.elements[0].elementName}</Text>
              </Text>
            ) : null}

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={styles.subLabel(c)}>RECCE</Text>
                <PhotoTile uri={img(recce?.photo)} size="100%" onPress={() => setSelectedImage(img(recce?.photo) || null)} />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={[styles.subLabel(c), { color: tone.success }]}>INSTALLED</Text>
                <PhotoTile uri={img(installationImage(photos[0]))} size="100%" onPress={() => setSelectedImage(img(installationImage(photos[0])) || null)} />
              </View>
            </View>

            {photos.length > 1 && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.subLabel(c)}>MORE PHOTOS ({photos.length - 1})</Text>
                <PhotoStrip>
                  {photos.slice(1).map((p: any, i: number) => (
                    <PhotoTile key={i} uri={img(installationImage(p))} size={72} onPress={() => setSelectedImage(img(installationImage(p)) || null)} />
                  ))}
                </PhotoStrip>
              </View>
            )}
          </Card>
        ))}
      </ScrollView>

      {/* Sticky primary action */}
      {canStart && (
        <View style={[styles.sticky, { backgroundColor: c.background, borderTopColor: c.border }]}>
          <Button
            label="Start installation"
            variant="primary"
            size="lg"
            flex
            icon={(col) => <CheckCircle2 size={18} color={col} />}
            onPress={() => navigation.navigate!('InstallationForm', { storeId: store._id })}
          />
        </View>
      )}

      <ImageViewer uri={selectedImage} onClose={() => setSelectedImage(null)} />
    </View>
  );
}

const styles = {
  ...StyleSheet.create({
    heroIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    boardChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    sticky: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
  }),
  subLabel: (c: any) => ({ color: c.textSecondary, fontSize: 10, fontWeight: '800' as const, letterSpacing: 0.6, marginBottom: 6 }),
};
