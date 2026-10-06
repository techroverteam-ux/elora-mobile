import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { MapPin, Building2, Package, IndianRupee, Camera, Ruler, FileText, CheckCircle2, XCircle, Clock, Edit3, X, Phone, User, Hash, Layers, ZoomIn } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { storeService } from '../../services/storeService';
import Toast from 'react-native-toast-message';
import imageService from '../../services/imageService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RecceStackParamList } from '../../navigation/types';
import {
  Card, StatusBadge, Button, EmptyState, BottomSheet, TextField, SegmentedControl,
  FactGrid, ContactCard, LocationCard, SpecsCard, CommercialCard,
  tone, alpha,
} from '../../components/ui';

type RecceDetailScreenNavigationProp = StackNavigationProp<RecceStackParamList, 'RecceDetail'>;
type RecceDetailScreenRouteProp = RouteProp<RecceStackParamList, 'RecceDetail'>;

interface RecceDetailProps {
  route: RecceDetailScreenRouteProp;
  navigation: RecceDetailScreenNavigationProp;
}

const APPROVAL_META: Record<string, { label: string; color: string }> = {
  APPROVED: { label: 'Approved', color: tone.success },
  REJECTED: { label: 'Rejected', color: tone.danger },
  PENDING: { label: 'Pending', color: tone.warning },
};

export default function RecceDetailScreen({ route, navigation }: RecceDetailProps) {
  const { theme } = useTheme();
  const { canViewCommercialInfo, isAdmin } = useAuth();
  const insets = useSafeAreaInsets();
  const { storeId } = route.params;
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [rejectionReason, setRejectionReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  const handleStatusChange = async () => {
    if (selectedPhotoIndex === null) return;
    if (newStatus === 'REJECTED' && !rejectionReason.trim()) {
      Toast.show({ type: 'error', text1: 'Please provide a rejection reason' });
      return;
    }

    setUpdatingStatus(true);
    try {
      await storeService.updateReccePhotoStatus(storeId, selectedPhotoIndex, {
        status: newStatus,
        rejectionReason: newStatus === 'REJECTED' ? rejectionReason : undefined,
      });
      Toast.show({ type: 'success', text1: `Photo ${selectedPhotoIndex + 1} ${newStatus.toLowerCase()}` });
      setShowStatusModal(false);
      setSelectedPhotoIndex(null);
      setRejectionReason('');
      fetchStoreDetails(); // Refresh data
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Failed to update status' });
    } finally {
      setUpdatingStatus(false);
    }
  };


  // ---------------------------------------------------------------------------
  // Presentation
  // ---------------------------------------------------------------------------
  const c = theme.colors;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center', gap: 10 }}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={{ color: c.textSecondary, fontSize: 13 }}>Loading recce details…</Text>
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

  const admin = isAdmin();
  const allPhotos: any[] = store.recce?.reccePhotos || [];
  const visiblePhotos = allPhotos.filter((photo: any) => admin || photo.approvalStatus === 'APPROVED');
  const approvedCount = allPhotos.filter((p: any) => p.approvalStatus === 'APPROVED').length;
  const rejectedCount = allPhotos.filter((p: any) => p.approvalStatus === 'REJECTED').length;
  const pendingCount = allPhotos.length - approvedCount - rejectedCount;
  const initialPhotos: string[] = store.recce?.initialPhotos || [];
  const mobile = store.contact?.mobile || store.contact?.phone || store.mobile || store.phone || store.contactMobile || store.dealerMobile;
  const locationLine = [store.location?.city, store.location?.district, store.location?.state].filter(Boolean).join(', ');

  const closeStatusSheet = () => {
    setShowStatusModal(false);
    setSelectedPhotoIndex(null);
    setRejectionReason('');
  };

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
          </View>
          <View style={{ marginTop: 12 }}>
            <StatusBadge status={store.currentStatus} />
          </View>

          {allPhotos.length > 0 && (
            <View style={[styles.statRow, { backgroundColor: c.surfaceSecondary }]}>
              <HeroStat label="Boards" value={allPhotos.length} color={c.text} />
              <HeroStat label="Approved" value={approvedCount} color={tone.success} />
              <HeroStat label="Pending" value={pendingCount} color={tone.warning} />
              <HeroStat label="Rejected" value={rejectedCount} color={tone.danger} />
            </View>
          )}
        </Card>

        {/* ---------- Contact ---------- */}
        <ContactCard name={store.contact?.personName} mobile={mobile} />

        {/* ---------- Identifiers ---------- */}
        <FactGrid
          items={[
            { label: 'Dealer code', value: store.dealerCode },
            { label: 'Vendor code', value: store.vendorCode },
            { label: 'Client code', value: store.clientCode },
            { label: 'Store ID', value: store.storeId },
          ]}
        />

        {/* ---------- Location ---------- */}
        <LocationCard location={store.location} />

        {/* ---------- Specs + commercial ---------- */}
        <SpecsCard specs={store.specs} />
        {canViewCommercialInfo() && <CommercialCard commercials={store.commercials} />}

        {/* ---------- Initial photos ---------- */}
        {initialPhotos.length > 0 && (
          <Card>
            <SectionTitle icon={<Camera size={16} color={c.textSecondary} />} title="Initial store photos" count={initialPhotos.length} theme={theme} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {initialPhotos.map((photo: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(imageService.getFullImageUrl(photo))}
                  activeOpacity={0.85}
                  style={styles.thumb}
                >
                  <Image source={{ uri: imageService.getFullImageUrl(photo) }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>
        )}

        {/* ---------- Recce boards ---------- */}
        {allPhotos.length > 0 && (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 2 }}>
              <Ruler size={16} color={c.textSecondary} />
              <Text style={{ color: c.text, fontSize: 16, fontWeight: '900', flex: 1 }}>
                Recce boards <Text style={{ color: c.textSecondary, fontWeight: '700' }}>({visiblePhotos.length})</Text>
              </Text>
              {!admin && <Text style={{ color: c.textSecondary, fontSize: 12 }}>Approved only</Text>}
            </View>

            {visiblePhotos.length === 0 && (
              <Card><EmptyState title="No approved boards yet" message="Boards appear here once they are approved." /></Card>
            )}

            {visiblePhotos.map((reccePhoto: any) => {
              // Find original index for proper mapping
              const originalIndex = allPhotos.findIndex((p: any) => p === reccePhoto);
              const approval = APPROVAL_META[reccePhoto.approvalStatus] || APPROVAL_META.PENDING;
              const m = reccePhoto.measurements || {};
              const inFeet = m.unit === 'in'
                ? `${(m.width / 12).toFixed(2)} × ${(m.height / 12).toFixed(2)} ft`
                : `${m.width} × ${m.height} ft`;
              return (
                <Card key={originalIndex} style={{ padding: 0, overflow: 'hidden', borderColor: reccePhoto.approvalStatus === 'REJECTED' ? alpha(tone.danger, 0.5) : c.border }}>
                  {/* Photo */}
                  <TouchableOpacity activeOpacity={0.9} onPress={() => setSelectedImage(imageService.getFullImageUrl(reccePhoto.photo))}>
                    {reccePhoto.photo ? (
                      <Image source={{ uri: imageService.getFullImageUrl(reccePhoto.photo) }} style={styles.boardImage} resizeMode="contain" />
                    ) : (
                      <View style={[styles.boardImage, { alignItems: 'center', justifyContent: 'center' }]}>
                        <Camera size={28} color="#64748B" />
                        <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 6 }}>No photo (direct installation)</Text>
                      </View>
                    )}
                    <View style={styles.boardOverlayTop}>
                      <View style={styles.boardNumber}><Text style={{ color: '#FFF', fontWeight: '900', fontSize: 12 }}>Board {originalIndex + 1}</Text></View>
                      <StatusBadge label={approval.label} color={approval.color} />
                    </View>
                    {!!reccePhoto.photo && (
                      <View style={styles.zoomHint}><ZoomIn size={14} color="#FFF" /></View>
                    )}
                  </TouchableOpacity>

                  {/* Facts */}
                  <View style={{ padding: 14, gap: 10 }}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={[styles.fact, { backgroundColor: c.surfaceSecondary }]}>
                        <Text style={[styles.factLabel, { color: c.textSecondary }]}>SIZE</Text>
                        <Text style={[styles.factValue, { color: c.text }]}>{m.width} × {m.height} {m.unit}</Text>
                      </View>
                      <View style={[styles.fact, { backgroundColor: c.surfaceSecondary }]}>
                        <Text style={[styles.factLabel, { color: c.textSecondary }]}>IN FEET</Text>
                        <Text style={[styles.factValue, { color: c.text }]}>{inFeet}</Text>
                      </View>
                    </View>

                    {reccePhoto.elements && reccePhoto.elements.length > 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Layers size={14} color={c.textSecondary} />
                        <Text style={{ color: c.textSecondary, fontSize: 12 }}>Element</Text>
                        <Text style={{ color: c.text, fontSize: 13, fontWeight: '800', flex: 1 }} numberOfLines={1}>{reccePhoto.elements[0].elementName}</Text>
                      </View>
                    )}

                    {!!reccePhoto.rejectionReason && (
                      <View style={[styles.reason, { backgroundColor: alpha(tone.danger, 0.08), borderLeftColor: tone.danger }]}>
                        <Text style={{ color: tone.danger, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 }}>REJECTION REASON</Text>
                        <Text style={{ color: c.text, fontSize: 13, marginTop: 2 }}>{reccePhoto.rejectionReason}</Text>
                      </View>
                    )}

                    {admin && (
                      <Button
                        label="Change status"
                        variant="outline"
                        size="sm"
                        icon={(col) => <Edit3 size={14} color={col} />}
                        onPress={() => {
                          setSelectedPhotoIndex(originalIndex);
                          setNewStatus('APPROVED');
                          setShowStatusModal(true);
                        }}
                      />
                    )}
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* ---------- Remarks ---------- */}
        {!!store.recce?.notes && (
          <Card>
            <SectionTitle icon={<FileText size={16} color={c.textSecondary} />} title="Remarks" theme={theme} />
            <View style={[styles.reason, { backgroundColor: c.surfaceSecondary, borderLeftColor: c.primary }]}>
              <Text style={{ fontSize: 14, color: c.text, lineHeight: 20 }}>{store.recce.notes}</Text>
            </View>
          </Card>
        )}

        {allPhotos.length === 0 && initialPhotos.length === 0 && (
          <Card>
            <EmptyState
              title="Recce not submitted yet"
              message="Photos and measurements will show here after the recce is submitted."
              icon={<Clock size={28} color={c.textTertiary} />}
            />
          </Card>
        )}
      </ScrollView>

      {/* ---------- Image viewer ---------- */}
      <Modal visible={!!selectedImage} transparent onRequestClose={() => setSelectedImage(null)} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setSelectedImage(null)}
            style={[styles.viewerClose, { top: insets.top + 16 }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={22} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={{ width: '100%', height: '80%' }} resizeMode="contain" />
          )}
        </View>
      </Modal>

      {/* ---------- Change status ---------- */}
      <BottomSheet
        visible={showStatusModal}
        onClose={closeStatusSheet}
        title={`Board ${selectedPhotoIndex !== null ? selectedPhotoIndex + 1 : ''} status`}
        subtitle="Approve the board or reject it with a reason"
        icon={<Edit3 size={18} color={c.text} />}
        maxHeight="70%"
        footer={
          <>
            <Button label="Cancel" variant="outline" size="lg" flex onPress={closeStatusSheet} />
            <Button
              label={updatingStatus ? 'Updating…' : newStatus === 'APPROVED' ? 'Approve' : 'Reject'}
              variant="solid"
              color={newStatus === 'APPROVED' ? tone.success : tone.danger}
              size="lg"
              flex
              loading={updatingStatus}
              disabled={updatingStatus || (newStatus === 'REJECTED' && !rejectionReason.trim())}
              icon={(col) => (newStatus === 'APPROVED' ? <CheckCircle2 size={16} color={col} /> : <XCircle size={16} color={col} />)}
              onPress={handleStatusChange}
            />
          </>
        }
      >
        <SegmentedControl
          label="New status"
          options={[{ key: 'APPROVED', label: 'Approve' }, { key: 'REJECTED', label: 'Reject' }]}
          value={newStatus}
          onChange={(k) => setNewStatus(k as 'APPROVED' | 'REJECTED')}
        />
        {newStatus === 'REJECTED' && (
          <TextField
            label="Rejection reason"
            required
            value={rejectionReason}
            onChangeText={setRejectionReason}
            placeholder="What needs to be fixed?"
            multiline
          />
        )}
      </BottomSheet>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Local presentation helpers
// ---------------------------------------------------------------------------
function SectionTitle({ icon, title, count, theme }: any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      {icon}
      <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '900', flex: 1 }}>
        {title}{count !== undefined ? <Text style={{ color: theme.colors.textSecondary, fontWeight: '700' }}>  {count}</Text> : null}
      </Text>
    </View>
  );
}

function InfoRow({ icon, label, value, theme, multiline, last }: any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: multiline ? 'flex-start' : 'center', gap: 10, paddingVertical: 9, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }}>
      {icon}
      <Text style={{ color: theme.colors.textSecondary, fontSize: 13, width: 92 }}>{label}</Text>
      <Text style={{ color: value ? theme.colors.text : theme.colors.textTertiary, fontSize: 13, fontWeight: '700', flex: 1, textAlign: multiline ? 'left' : 'right' }} numberOfLines={multiline ? 4 : 1}>
        {value || '—'}
      </Text>
    </View>
  );
}

function MiniFact({ label, value, theme }: any) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, gap: 6 }}>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '800', flexShrink: 1, textAlign: 'right' }} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function HeroStat({ label, value, color }: any) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color, fontSize: 18, fontWeight: '900' }}>{value}</Text>
      <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statRow: { flexDirection: 'row', borderRadius: 12, paddingVertical: 10, marginTop: 14 },
  thumb: { width: 96, height: 96, borderRadius: 12, overflow: 'hidden', backgroundColor: '#0F172A' },
  boardImage: { width: '100%', height: 220, backgroundColor: '#0F172A' },
  boardOverlayTop: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  boardNumber: { backgroundColor: 'rgba(15,23,42,0.75)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  zoomHint: { position: 'absolute', bottom: 10, right: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(15,23,42,0.6)', alignItems: 'center', justifyContent: 'center' },
  fact: { flex: 1, borderRadius: 10, padding: 10 },
  factLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  factValue: { fontSize: 14, fontWeight: '900', marginTop: 2 },
  reason: { borderLeftWidth: 3, borderRadius: 8, padding: 10 },
  viewerClose: { position: 'absolute', right: 16, zIndex: 1, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
});
