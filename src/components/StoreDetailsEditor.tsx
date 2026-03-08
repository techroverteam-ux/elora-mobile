import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { Edit2, Save, X, Package, IndianRupee, FileText, Building2 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { storeService } from '../services/storeService';
import Toast from 'react-native-toast-message';

interface StoreDetailsEditorProps {
  storeId: string;
  initialData: any;
  onUpdate: (updatedData: any) => void;
}

export default function StoreDetailsEditor({ storeId, initialData, onUpdate }: StoreDetailsEditorProps) {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Details
    dealerCode: '',
    storeName: '',
    vendorCode: '',
    clientCode: '',
    
    // Specifications
    specs: {
      type: '',
      qty: 1,
      width: 0,
      height: 0,
      boardSize: 0
    },
    
    // Cost Details
    costDetails: {
      boardRate: 0,
      totalBoardCost: 0,
      angleCharges: 0,
      scaffoldingCharges: 0,
      transportation: 0
    },
    
    // Commercial Details
    commercials: {
      poNumber: '',
      poMonth: '',
      invoiceNumber: '',
      invoiceRemarks: '',
      totalCost: 0
    },
    
    // Contact Details
    contact: {
      personName: '',
      mobile: '',
      email: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        dealerCode: initialData.dealerCode || '',
        storeName: initialData.storeName || '',
        vendorCode: initialData.vendorCode || '',
        clientCode: initialData.clientCode || '',
        specs: {
          type: initialData.specs?.type || '',
          qty: initialData.specs?.qty || 1,
          width: initialData.specs?.width || 0,
          height: initialData.specs?.height || 0,
          boardSize: initialData.specs?.boardSize || 0
        },
        costDetails: {
          boardRate: initialData.costDetails?.boardRate || 0,
          totalBoardCost: initialData.costDetails?.totalBoardCost || 0,
          angleCharges: initialData.costDetails?.angleCharges || 0,
          scaffoldingCharges: initialData.costDetails?.scaffoldingCharges || 0,
          transportation: initialData.costDetails?.transportation || 0
        },
        commercials: {
          poNumber: initialData.commercials?.poNumber || '',
          poMonth: initialData.commercials?.poMonth || '',
          invoiceNumber: initialData.commercials?.invoiceNumber || '',
          invoiceRemarks: initialData.commercials?.invoiceRemarks || '',
          totalCost: initialData.commercials?.totalCost || 0
        },
        contact: {
          personName: initialData.contact?.personName || '',
          mobile: initialData.contact?.mobile || '',
          email: initialData.contact?.email || ''
        }
      });
    }
  }, [initialData]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Calculate board size if width and height are provided
      if (formData.specs.width && formData.specs.height) {
        formData.specs.boardSize = formData.specs.width * formData.specs.height;
      }
      
      // Calculate total board cost if rate and size are provided
      if (formData.costDetails.boardRate && formData.specs.boardSize) {
        formData.costDetails.totalBoardCost = formData.costDetails.boardRate * formData.specs.boardSize * formData.specs.qty;
      }

      await storeService.update(storeId, formData);
      Toast.show({ type: 'success', text1: 'Store updated successfully' });
      setModalVisible(false);
      onUpdate(formData);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Failed to update store' });
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title: string, icon: any, children: React.ReactNode) => (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        {icon}
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );

  const renderInput = (label: string, value: string | number, onChangeText: (text: string) => void, options?: any) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        value={String(value)}
        onChangeText={onChangeText}
        style={{
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 8,
          padding: 12,
          color: theme.colors.text,
          fontSize: 16
        }}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={theme.colors.textSecondary}
        keyboardType={options?.numeric ? 'decimal-pad' : 'default'}
        {...options}
      />
    </View>
  );

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          backgroundColor: theme.colors.primary + '20',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <Edit2 size={16} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.primary, marginLeft: 6, fontWeight: '600' }}>
          Edit Details
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <View style={{
            backgroundColor: theme.colors.primary,
            paddingTop: 50,
            paddingBottom: 16,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF' }}>
              Edit Store Details
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            {renderSection('Basic Information', <Building2 size={20} color={theme.colors.primary} />, (
              <View>
                {renderInput('Dealer Code', formData.dealerCode, (text) => setFormData({...formData, dealerCode: text}))}
                {renderInput('Store Name', formData.storeName, (text) => setFormData({...formData, storeName: text}))}
                {renderInput('Vendor Code', formData.vendorCode, (text) => setFormData({...formData, vendorCode: text}))}
                {renderInput('Client Code', formData.clientCode, (text) => setFormData({...formData, clientCode: text}))}
              </View>
            ))}

            {renderSection('Board Specifications', <Package size={20} color={theme.colors.primary} />, (
              <View>
                {renderInput('Board Type', formData.specs.type, (text) => setFormData({...formData, specs: {...formData.specs, type: text}}))}
                {renderInput('Quantity', formData.specs.qty, (text) => setFormData({...formData, specs: {...formData.specs, qty: Number(text) || 1}}), { numeric: true })}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    {renderInput('Width (ft)', formData.specs.width, (text) => setFormData({...formData, specs: {...formData.specs, width: Number(text) || 0}}), { numeric: true })}
                  </View>
                  <View style={{ flex: 1 }}>
                    {renderInput('Height (ft)', formData.specs.height, (text) => setFormData({...formData, specs: {...formData.specs, height: Number(text) || 0}}), { numeric: true })}
                  </View>
                </View>
                <View style={{
                  backgroundColor: theme.colors.primary + '10',
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.colors.primary + '30'
                }}>
                  <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: '600' }}>
                    Board Size: {(formData.specs.width * formData.specs.height).toFixed(2)} sq.ft
                  </Text>
                </View>
              </View>
            ))}

            {renderSection('Cost Details', <IndianRupee size={20} color={theme.colors.primary} />, (
              <View>
                {renderInput('Board Rate (₹/sq.ft)', formData.costDetails.boardRate, (text) => setFormData({...formData, costDetails: {...formData.costDetails, boardRate: Number(text) || 0}}), { numeric: true })}
                {renderInput('Angle Charges (₹)', formData.costDetails.angleCharges, (text) => setFormData({...formData, costDetails: {...formData.costDetails, angleCharges: Number(text) || 0}}), { numeric: true })}
                {renderInput('Scaffolding Charges (₹)', formData.costDetails.scaffoldingCharges, (text) => setFormData({...formData, costDetails: {...formData.costDetails, scaffoldingCharges: Number(text) || 0}}), { numeric: true })}
                {renderInput('Transportation (₹)', formData.costDetails.transportation, (text) => setFormData({...formData, costDetails: {...formData.costDetails, transportation: Number(text) || 0}}), { numeric: true })}
                <View style={{
                  backgroundColor: '#10B98110',
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#10B98130'
                }}>
                  <Text style={{ color: '#10B981', fontSize: 16, fontWeight: 'bold' }}>
                    Total Board Cost: ₹{(formData.costDetails.boardRate * formData.specs.width * formData.specs.height * formData.specs.qty).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}

            {renderSection('Commercial Details', <FileText size={20} color={theme.colors.primary} />, (
              <View>
                {renderInput('PO Number', formData.commercials.poNumber, (text) => setFormData({...formData, commercials: {...formData.commercials, poNumber: text}}))}
                {renderInput('PO Month', formData.commercials.poMonth, (text) => setFormData({...formData, commercials: {...formData.commercials, poMonth: text}}))}
                {renderInput('Invoice Number', formData.commercials.invoiceNumber, (text) => setFormData({...formData, commercials: {...formData.commercials, invoiceNumber: text}}))}
                {renderInput('Total Cost (₹)', formData.commercials.totalCost, (text) => setFormData({...formData, commercials: {...formData.commercials, totalCost: Number(text) || 0}}), { numeric: true })}
                <View>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>
                    Invoice Remarks
                  </Text>
                  <TextInput
                    value={formData.commercials.invoiceRemarks}
                    onChangeText={(text) => setFormData({...formData, commercials: {...formData.commercials, invoiceRemarks: text}})}
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderRadius: 8,
                      padding: 12,
                      color: theme.colors.text,
                      fontSize: 16,
                      minHeight: 80,
                      textAlignVertical: 'top'
                    }}
                    placeholder="Enter invoice remarks"
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                  />
                </View>
              </View>
            ))}

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 40 }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: theme.colors.surface,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: loading ? theme.colors.border : theme.colors.primary,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center'
                }}
              >
                <Save size={20} color="#FFF" />
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}