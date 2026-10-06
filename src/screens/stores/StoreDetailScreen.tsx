import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MapPin, Building2, Package, IndianRupee, Camera, Ruler, FileText, Workflow, Hash, User, Phone, Calendar, Layers, ZoomIn, Wrench, Flag } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { storeService } from '../../services/storeService';
import Toast from 'react-native-toast-message';
import imageService from '../../services/imageService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StoreDetailsEditor from '../../components/StoreDetailsEditor';
import {
  Card, StatusBadge, EmptyState,
  SectionTitle, MiniFact, StatStrip, Timeline, PhotoTile, PhotoStrip, ImageViewer,
  FactGrid, ContactCard, LocationCard, SpecsCard, CommercialCard,
  tone, alpha,
} from '../../components/ui';

interface StoreDetailProps {
  route: {
    params: {
      storeId: string;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

const APPROVAL_META: Record<string, { label: string; color: string }> = {
  APPROVED: { label: 'Approved', color: tone.success },
  REJECTED: { label: 'Rejected', color: tone.danger },
  PENDING: { label: 'Pending', color: tone.warning },
};

const PRIORITY_COLOR: Record<string, string> = { HIGH: tone.danger, MEDIUM: tone.warning, LOW: tone.success };

const COST_LINES: Array<{ key: string; label: string }> = [
  { key: 'angleCharges', label: 'Angle charges' },
  { key: 'scaffoldingCharges', label: 'Scaffolding' },
  { key: 'transportation', label: 'Transportation' },
  { key: 'flanges', label: 'Flanges' },
  { key: 'lollipop', label: 'Lollipop' },
  { key: 'oneWayVision', label: 'One way vision' },
  { key: 'sunboard', label: 'Sunboard' },
];

export default function StoreDetailScreen({ route, navigation }: StoreDetailProps) {
  const { theme } = useTheme();
  const { canViewCommercialInfo } = useAuth();
  const { hasPermission } = usePermissions();
  const insets = useSafeAreaInsets();
  const { storeId } = route.params;
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Re-fetch every time this screen is focused — both on first mount, and
  // (crucially) every time it regains focus, e.g. coming back from the Recce
  // form (or Installation form) after submitting photos. React Navigation
  // keeps this screen mounted underneath while those forms are open, so a
  // mount-only effect never re-runs and this screen kept showing the
  // pre-submission store data (no recce photos at all) even though the
  // upload itself succeeded. This matches the reported symptom exactly: both
  // initial photos and recce photos "not showing back" after a recce is
  // completed, regardless of whether the photo came from the camera or
  // gallery — it was never actually a photo/upload problem.
  useFocusEffect(
    useCallback(() => {
      fetchStoreDetails();
    }, [storeId])
  );

  const fetchStoreDetails = async () => {
    try {
      setLoading(true);
      const response = await storeService.getById(storeId);
      setStore(response.store || response);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return undefined;
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // ---------------------------------------------------------------------------
  // Presentation
  // ---------------------------------------------------------------------------
  const c = theme.colors;

  // Only show the full-screen loader on the very first load. Re-fetches on
  // focus (see useFocusEffect above) now refresh in place instead of blanking
  // the whole screen every time you come back to it.
  if (loading && !store) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center', gap: 10 }}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={{ color: c.textSecondary, fontSize: 13 }}>Loading store…</Text>
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

  const img = (path?: string) => (path && typeof path === 'string' ? imageService.getFullImageUrl(path) : undefined);
  const canSeeMoney = canViewCommercialInfo();
  const initialPhotos: string[] = (store.recce?.initialPhotos || []).filter((p: any) => p && typeof p === 'string');
  const reccePhotos: any[] = (store.recce?.reccePhotos || []).filter((p: any) => p?.photo && typeof p.photo === 'string');
  const installPhotos: string[] = (store.installation?.photos || [])
    .map((p: any) => (typeof p === 'string' ? p : p?.installationPhoto))
    .filter((u: any) => u && typeof u === 'string');
  const locationLine = [store.location?.city, store.location?.district, store.location?.state].filter(Boolean).join(', ');
  const costs = store.costDetails || {};
  const boardRate = store.costDetails?.boardRate || store.recce?.costDetails?.boardRate;
  const totalBoardCost = store.costDetails?.totalBoardCost || store.recce?.costDetails?.totalBoardCost;
  const hasCostDetails = !!(store.costDetails || store.recce?.costDetails);
  const hasApprovalCounts = !!store.recce && (store.recce.approvedPhotosCount > 0 || store.recce.rejectedPhotosCount > 0 || store.recce.pendingPhotosCount > 0);
  const status = store.currentStatus || '';

  const recceDone = ['RECCE_SUBMITTED', 'RECCE_APPROVED', 'INSTALLATION_ASSIGNED', 'INSTALLATION_SUBMITTED', 'COMPLETED'].includes(status) || !!store.recce?.submittedDate;
  const installDone = ['INSTALLATION_SUBMITTED', 'COMPLETED'].includes(status) || !!store.installation?.submittedDate;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        {/* ---------- Hero ---------- */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <View style={[styles.heroIcon, { backgroundColor: alpha(c.primary, 0.16) }]}>
              <Building2 size={22} color={c.text} />
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
            {hasPermission('stores', 'edit') && (
              <StoreDetailsEditor
                storeId={storeId}
                initialData={store}
                onUpdate={(updatedData: any) => {
                  setStore((prev: any) => ({ ...prev, ...updatedData }));
                }}
              />
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <StatusBadge status={status} />
            {store.workflow?.priority && (
              <StatusBadge label={`${store.workflow.priority} priority`} color={PRIORITY_COLOR[store.workflow.priority] || tone.neutral} />
            )}
            {loading && <ActivityIndicator size="small" color={c.textTertiary} />}
          </View>

          {hasApprovalCounts && (
            <StatStrip
              items={[
                { label: 'Approved', value: store.recce.approvedPhotosCount || 0, color: tone.success },
                { label: 'Pending', value: store.recce.pendingPhotosCount || 0, color: tone.warning },
                { label: 'Rejected', value: store.recce.rejectedPhotosCount || 0, color: tone.danger },
              ]}
            />
          )}
        </Card>

        {/* ---------- Progress ---------- */}
        <Card>
          <SectionTitle icon={<Workflow size={16} color={c.textSecondary} />} title="Progress" />
          <Timeline
            steps={[
              { title: 'Store created', meta: formatDate(store.createdAt), done: true },
              {
                title: 'Recce assigned',
                subtitle: store.workflow?.recceAssignedTo?.name ? `to ${store.workflow.recceAssignedTo.name}` : 'Not assigned yet',
                meta: formatDate(store.recce?.assignedDate),
                done: !!store.workflow?.recceAssignedTo,
                active: !store.workflow?.recceAssignedTo,
              },
              {
                title: 'Recce submitted',
                subtitle: store.recce?.submittedBy ? `by ${store.recce.submittedBy}` : recceDone ? undefined : 'Waiting for recce',
                meta: formatDate(store.recce?.submittedDate),
                done: recceDone,
                active: !!store.workflow?.recceAssignedTo && !recceDone,
              },
              {
                title: 'Installation assigned',
                subtitle: store.workflow?.installationAssignedTo?.name ? `to ${store.workflow.installationAssignedTo.name}` : 'Not assigned yet',
                meta: formatDate(store.installation?.assignedDate),
                done: !!store.workflow?.installationAssignedTo,
                active: status === 'RECCE_APPROVED',
              },
              {
                title: 'Installation submitted',
                subtitle: store.installation?.submittedBy ? `by ${store.installation.submittedBy}` : installDone ? undefined : 'Waiting for installer',
                meta: formatDate(store.installation?.submittedDate),
                done: installDone,
                active: status === 'INSTALLATION_ASSIGNED',
              },
              { title: 'Completed', done: status === 'COMPLETED', active: status === 'INSTALLATION_SUBMITTED' },
            ]}
          />
        </Card>

        {/* ---------- Contact ---------- */}
        <ContactCard name={store.contact?.personName} mobile={store.contact?.mobile} />

        {/* ---------- Identifiers ---------- */}
        <FactGrid
          items={[
            { label: 'Dealer code', value: store.dealerCode },
            { label: 'Vendor code', value: store.vendorCode },
            { label: 'Client code', value: store.clientCode },
            { label: 'Store code', value: store.storeCode },
            { label: 'Project ID', value: store.projectID },
            { label: 'Last updated', value: formatDate(store.updatedAt) },
          ]}
        />

        {/* ---------- Location ---------- */}
        <LocationCard location={store.location} />

        {/* ---------- Specs + commercial ---------- */}
        <SpecsCard specs={store.specs} />
        {canSeeMoney && <CommercialCard commercials={store.commercials} />}

        {/* ---------- Cost breakdown ---------- */}
        {canSeeMoney && hasCostDetails && (
          <Card>
            <SectionTitle icon={<IndianRupee size={16} color={c.textSecondary} />} title="Cost breakdown" />
            {!!boardRate && <MiniFact label="Board rate" value={`₹${boardRate}/sq.ft`} />}
            {!!totalBoardCost && <MiniFact label="Total board cost" value={`₹${totalBoardCost?.toLocaleString()}`} />}
            {COST_LINES.filter(l => costs[l.key] > 0).map(l => (
              <MiniFact key={l.key} label={l.label} value={`₹${costs[l.key].toLocaleString()}`} />
            ))}
            <View style={[styles.grandTotal, { backgroundColor: alpha(tone.success, 0.1) }]}>
              <Text style={{ color: tone.success, fontSize: 14, fontWeight: '900' }}>Grand total</Text>
              <Text style={{ color: tone.success, fontSize: 18, fontWeight: '900' }}>
                ₹{(store.recce?.commercials?.totalCost || store.commercials?.totalCost || 0).toLocaleString()}
              </Text>
            </View>
          </Card>
        )}

        {/* ---------- Initial photos ---------- */}
        {initialPhotos.length > 0 && (
          <Card>
            <SectionTitle icon={<Camera size={16} color={c.textSecondary} />} title="Initial store photos" count={initialPhotos.length} />
            <PhotoStrip>
              {initialPhotos.map((photo, index) => (
                <PhotoTile key={index} uri={img(photo)} onPress={() => setSelectedImage(img(photo) || null)} />
              ))}
            </PhotoStrip>
          </Card>
        )}

        {/* ---------- Recce boards ---------- */}
        {reccePhotos.length > 0 && (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 2 }}>
              <Ruler size={16} color={c.textSecondary} />
              <Text style={{ color: c.text, fontSize: 16, fontWeight: '900' }}>
                Recce boards <Text style={{ color: c.textSecondary, fontWeight: '700' }}>({reccePhotos.length})</Text>
              </Text>
            </View>
            {reccePhotos.map((rp: any, index: number) => {
              const approval = APPROVAL_META[rp.approvalStatus] || APPROVAL_META.PENDING;
              const m = rp.measurements || {};
              const uri = img(rp.photo);
              return (
                <Card key={index} style={{ padding: 0, overflow: 'hidden', borderColor: rp.approvalStatus === 'REJECTED' ? alpha(tone.danger, 0.5) : c.border }}>
                  <TouchableOpacity activeOpacity={0.9} onPress={() => uri && setSelectedImage(uri)}>
                    <Image source={{ uri }} style={styles.boardImage} resizeMode="contain" />
                    <View style={styles.boardOverlay}>
                      <View style={styles.boardNumber}><Text style={{ color: '#FFF', fontWeight: '900', fontSize: 12 }}>Board {index + 1}</Text></View>
                      <StatusBadge label={approval.label} color={approval.color} />
                    </View>
                    <View style={styles.zoomHint}><ZoomIn size={14} color="#FFF" /></View>
                  </TouchableOpacity>
                  <View style={{ padding: 14, gap: 10 }}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={[styles.fact, { backgroundColor: c.surfaceSecondary }]}>
                        <Text style={[styles.factLabel, { color: c.textSecondary }]}>SIZE</Text>
                        <Text style={[styles.factValue, { color: c.text }]}>{m.width || 0} × {m.height || 0} {m.unit || 'ft'}</Text>
                      </View>
                      {m.unit === 'in' && (
                        <View style={[styles.fact, { backgroundColor: c.surfaceSecondary }]}>
                          <Text style={[styles.factLabel, { color: c.textSecondary }]}>IN FEET</Text>
                          <Text style={[styles.factValue, { color: c.text }]}>{(m.width / 12).toFixed(2)} × {(m.height / 12).toFixed(2)} ft</Text>
                        </View>
                      )}
                    </View>
                    {rp.elements && rp.elements.length > 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Layers size={14} color={c.textSecondary} />
                        <Text style={{ color: c.textSecondary, fontSize: 12 }}>Element</Text>
                        <Text style={{ color: c.text, fontSize: 13, fontWeight: '800', flex: 1 }} numberOfLines={1}>{rp.elements[0].elementName}</Text>
                      </View>
                    )}
                    {!!rp.rejectionReason && (
                      <View style={[styles.note, { backgroundColor: alpha(tone.danger, 0.08), borderLeftColor: tone.danger }]}>
                        <Text style={{ color: tone.danger, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 }}>REJECTION REASON</Text>
                        <Text style={{ color: c.text, fontSize: 13, marginTop: 2 }}>{rp.rejectionReason}</Text>
                      </View>
                    )}
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* ---------- Installation photos ---------- */}
        {installPhotos.length > 0 && (
          <Card>
            <SectionTitle icon={<Wrench size={16} color={c.textSecondary} />} title="Installation photos" count={installPhotos.length} />
            <PhotoStrip>
              {installPhotos.map((p, index) => (
                <PhotoTile key={index} uri={img(p)} onPress={() => setSelectedImage(img(p) || null)} />
              ))}
            </PhotoStrip>
            {!!store.installation?.submittedBy && (
              <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }}>
                <MiniFact label="Submitted by" value={store.installation.submittedBy} />
                {!!store.installation?.submittedDate && <MiniFact label="Submitted" value={formatDate(store.installation.submittedDate)} />}
              </View>
            )}
          </Card>
        )}

        {/* ---------- Remarks ---------- */}
        {!!store.recce?.notes && (
          <Card>
            <SectionTitle icon={<FileText size={16} color={c.textSecondary} />} title="Remarks" />
            <View style={[styles.note, { backgroundColor: c.surfaceSecondary, borderLeftColor: c.primary }]}>
              <Text style={{ fontSize: 14, color: c.text, lineHeight: 20 }}>{store.recce.notes}</Text>
            </View>
          </Card>
        )}

        {reccePhotos.length === 0 && initialPhotos.length === 0 && installPhotos.length === 0 && (
          <Card>
            <EmptyState
              title="No photos yet"
              message="Recce and installation photos will appear here once they are submitted."
              icon={<Flag size={28} color={c.textTertiary} />}
            />
          </Card>
        )}
      </ScrollView>

      <ImageViewer uri={selectedImage} onClose={() => setSelectedImage(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  heroIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  boardImage: { width: '100%', height: 220, backgroundColor: '#0F172A' },
  boardOverlay: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  boardNumber: { backgroundColor: 'rgba(15,23,42,0.75)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  zoomHint: { position: 'absolute', bottom: 10, right: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(15,23,42,0.6)', alignItems: 'center', justifyContent: 'center' },
  fact: { flex: 1, borderRadius: 10, padding: 10 },
  factLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  factValue: { fontSize: 14, fontWeight: '900', marginTop: 2 },
  note: { borderLeftWidth: 3, borderRadius: 8, padding: 10 },
  grandTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10, padding: 12, marginTop: 8 },
});
