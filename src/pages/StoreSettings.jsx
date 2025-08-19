
import React, { useState, useEffect } from 'react';
import { StoreConfig } from '@/api/entities';
import { DeliveryZone } from '@/api/entities'; // New import for DeliveryZone entity
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Image, Trash2, Plus, Phone, Bike, Palette, MapPin, Save, Upload, X } from 'lucide-react'; // Added MapPin, Save, Upload, X
import { motion } from 'framer-motion';
import { UploadFile } from '@/api/integrations';
import { cn } from "@/lib/utils";

export default function StoreSettings() {
  const [config, setConfig] = useState(null); // Keep for identifying if update or create
  const [formData, setFormData] = useState({
    store_name: '',
    logo_url: '',
    whatsapp_number: '',
    delivery_whatsapp_number: '',
    banner_images: [], // Ensure this remains an array for new structure
    address: 'Rua Presidente Vargas, Itaituba, PA, Brasil',
    opening_hours: 'Segunda a Sábado: 8h às 18h',
    social_media: [],
    theme_primary: '#1e40af',
    theme_accent: '#3b82f6',
    theme_text: '#0f172a',
    theme_background: '#ffffff',
    powered_by_logo: '', // New field
    powered_by_whatsapp_link: '' // New field
  });
  const [deliveryZones, setDeliveryZones] = useState([]); // New state for delivery zones
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false); // New state for logo upload status
  const [poweredByLogoUploading, setPoweredByLogoUploading] = useState(false); // New state for powered by logo upload status
  const [isUploading, setIsUploading] = useState(false); // Existing state for banner uploads
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadConfig();
    loadDeliveryZones(); // Load delivery zones on component mount
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const configs = await StoreConfig.list();
      if (configs.length > 0) {
        const loadedConfig = configs[0];
        setConfig(loadedConfig);
        setFormData(prevFormData => ({
            ...prevFormData,
            ...loadedConfig,
            banner_images: loadedConfig.banner_images || [], // Garante que seja sempre um array
            social_media: loadedConfig.social_media || [] // Garante que seja sempre um array
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
    setIsLoading(false);
  };

  const loadDeliveryZones = async () => {
    try {
      const zones = await DeliveryZone.list();
      setDeliveryZones(zones);
    } catch (error) {
      console.error("Erro ao carregar zonas de entrega:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage('');
    try {
      if (config) {
        await StoreConfig.update(config.id, formData);
      } else {
        await StoreConfig.create(formData);
      }
      setSuccessMessage('Configurações salvas com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadConfig(); // Re-load config to ensure updated data (like IDs if new) is reflected
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    }
    setIsSaving(false);
  };

  const handleImageUpload = async (e, field, options = {}) => {
    const { bannerIndex, urlType } = options;
    const file = e.target.files[0];
    if (!file) return;

    let currentSetUploading;
    if (field === 'logo_url') {
      currentSetUploading = setLogoUploading;
    } else if (field === 'powered_by_logo') {
      currentSetUploading = setPoweredByLogoUploading;
    } else {
      currentSetUploading = setIsUploading; // For banner images
    }

    currentSetUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      if (field === 'logo_url') {
        setFormData(prev => ({ ...prev, logo_url: file_url }));
      } else if (field === 'powered_by_logo') { // Handle new powered_by_logo field
        setFormData(prev => ({ ...prev, powered_by_logo: file_url }));
      } else if (field === 'banner_images' && bannerIndex !== null) {
        setFormData(prev => {
            const newBanners = [...prev.banner_images];
            if (newBanners[bannerIndex]) {
                const keyToUpdate = urlType === 'mobile' ? 'url_mobile' : 'url_desktop';
                newBanners[bannerIndex] = { ...newBanners[bannerIndex], [keyToUpdate]: file_url };
            } else {
                newBanners.push({ 
                    url_desktop: urlType === 'desktop' ? file_url : '', 
                    url_mobile: urlType === 'mobile' ? file_url : '', 
                    title: '', 
                    link: '' 
                });
            }
            return { ...prev, banner_images: newBanners };
        });
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    }
    currentSetUploading(false);
  };

  const handleSocialChange = (index, field, value) => {
    setFormData(prev => ({
        ...prev,
        social_media: prev.social_media.map((social, i) => 
            i === index ? { ...social, [field]: value } : social
        )
    }));
  };

  const addSocial = () => {
    setFormData(prev => ({
        ...prev,
        social_media: [...prev.social_media, { network: 'Instagram', url: '' }]
    }));
  };

  const removeSocial = (index) => {
    setFormData(prev => ({
        ...prev,
        social_media: prev.social_media.filter((_, i) => i !== index)
    }));
  };
  
  const handleBannerChange = (index, field, value) => {
    setFormData(prev => ({
        ...prev,
        banner_images: prev.banner_images.map((banner, i) => 
            i === index ? { ...banner, [field]: value } : banner
        )
    }));
  };
  
  const addBanner = () => {
    setFormData(prev => ({
        ...prev,
        banner_images: [...prev.banner_images, { url_desktop: '', url_mobile: '', title: '', link: '' }]
    }));
  };
  
  const removeBanner = (index) => {
    setFormData(prev => ({
        ...prev,
        banner_images: prev.banner_images.filter((_, i) => i !== index)
    }));
  };

  const handleZoneChange = (index, field, value) => {
    setDeliveryZones(prev => prev.map((zone, i) => 
      i === index ? { ...zone, [field]: value } : zone
    ));
  };

  const addZone = () => {
    setDeliveryZones(prev => [...prev, { neighborhood: '', fee: 0 }]);
  };

  const removeZone = (index) => {
    setDeliveryZones(prev => prev.filter((_, i) => i !== index));
  };

  const saveDeliveryZones = async () => {
    setIsSaving(true);
    setSuccessMessage('');
    try {
      const existingZones = await DeliveryZone.list();
      for (const zone of existingZones) {
        await DeliveryZone.delete(zone.id);
      }
      
      for (const zone of deliveryZones) {
        if (zone.neighborhood && typeof zone.fee === 'number' && !isNaN(zone.fee)) {
          await DeliveryZone.create({
            neighborhood: zone.neighborhood,
            fee: parseFloat(zone.fee)
          });
        }
      }
      
      setSuccessMessage('Zonas de entrega salvas com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadDeliveryZones();
    } catch (error) {
      console.error("Erro ao salvar zonas:", error);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-20 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Configurações da Loja</h1>
            <p className="text-slate-600 mt-1">Gerencie as informações e aparência da sua loja</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <Save className="w-4 h-4 mr-2" /> {/* Added Save icon */}
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg"
          >
            {successMessage}
          </motion.div>
        )}

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Básico</span>
            </TabsTrigger>
            <TabsTrigger value="delivery" className="flex items-center gap-2">
              <Bike className="w-4 h-4" />
              <span className="hidden sm:inline">Entrega</span>
            </TabsTrigger>
            <TabsTrigger value="zones" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Bairros</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Aparência</span>
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Banners</span>
            </TabsTrigger>
          </TabsList>

          {/* Aba Básico */}
          <TabsContent value="basic">
            {/* Informações Básicas Card */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-slate-200/60 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Informações Básicas e Identidade Visual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="store_name">Nome da Loja *</Label>
                    <Input
                      id="store_name"
                      value={formData.store_name}
                      onChange={(e) => handleInputChange('store_name', e.target.value)}
                      placeholder="Nome da sua loja"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp_number">WhatsApp da Loja *</Label>
                    <Input
                      id="whatsapp_number"
                      value={formData.whatsapp_number}
                      onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                      placeholder="5593991234567"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address">Endereço Completo</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Rua, número, bairro, cidade"
                    />
                  </div>
                  <div>
                    <Label htmlFor="opening_hours">Horário de Funcionamento</Label>
                    <Input
                      id="opening_hours"
                      value={formData.opening_hours}
                      onChange={(e) => handleInputChange('opening_hours', e.target.value)}
                      placeholder="Segunda a Sábado: 8h às 18h"
                    />
                  </div>
                </div>

                {/* Logo da Loja - Integrated from outline, adapted */}
                <div>
                  <Label>Logo da Loja</Label>
                  <p className="text-sm text-slate-500 mt-1 mb-3">
                    A logo aparecerá no cabeçalho da loja. Recomendamos PNG transparente com dimensões 200x80px ou similar.
                  </p>
                  
                  <div className="flex items-center gap-4">
                    {formData.logo_url && (
                      <div className="relative">
                        <img 
                          src={formData.logo_url} 
                          alt="Logo da Loja" 
                          className="h-16 max-w-32 object-contain border border-slate-200 rounded-lg p-2"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute -top-2 -right-2 w-6 h-6"
                          onClick={() => handleInputChange('logo_url', '')} // Clear logo
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    
                    <div>
                      <input
                        type="file"
                        accept="image/png,image/jpg,image/jpeg"
                        onChange={(e) => handleImageUpload(e, 'logo_url')}
                        className="hidden"
                        id="logo-upload"
                        disabled={logoUploading}
                      />
                      <label htmlFor="logo-upload">
                        <Button asChild disabled={logoUploading}>
                          <span className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            {logoUploading ? "Enviando..." : formData.logo_url ? "Alterar Logo" : "Adicionar Logo"}
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Redes Sociais */}
                <div>
                  <Label>Redes Sociais</Label>
                  <div className="space-y-3 mt-2">
                    {formData.social_media.map((social, index) => (
                      <div key={index} className="flex gap-2">
                        <select
                          value={social.network}
                          onChange={(e) => handleSocialChange(index, 'network', e.target.value)}
                          className="px-3 py-2 border border-slate-200 rounded-md"
                        >
                          <option value="Instagram">Instagram</option>
                          <option value="Facebook">Facebook</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="iFood">iFood</option>
                        </select>
                        <Input
                          placeholder="URL da rede social"
                          value={social.url}
                          onChange={(e) => handleSocialChange(index, 'url', e.target.value)}
                          className="flex-1"
                        />
                        <Button variant="outline" onClick={() => removeSocial(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addSocial}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Rede Social
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Powered By Personalizado Card - New Section from outline */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-purple-600" />
                  "Powered By" Personalizado
                </CardTitle>
                <p className="text-sm text-slate-500 pt-1">
                  Personalize a seção "Powered By" no rodapé da sua loja.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Logo "Powered By"</Label>
                  <p className="text-sm text-slate-500 mb-3">
                    Logo que aparecerá no rodapé no lugar de "Base44". Recomendamos PNG com fundo transparente.
                  </p>
                  
                  <div className="flex items-center gap-4">
                    {formData.powered_by_logo && (
                      <div className="relative">
                        <img 
                          src={formData.powered_by_logo} 
                          alt="Powered By Logo" 
                          className="h-12 max-w-24 object-contain border border-slate-200 rounded-lg p-2"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute -top-2 -right-2 w-6 h-6"
                          onClick={() => handleInputChange('powered_by_logo', '')} // Clear powered by logo
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    
                    <div>
                      <input
                        type="file"
                        accept="image/png,image/jpg,image/jpeg"
                        onChange={(e) => handleImageUpload(e, 'powered_by_logo')}
                        className="hidden"
                        id="powered-by-logo-upload"
                        disabled={poweredByLogoUploading}
                      />
                      <label htmlFor="powered-by-logo-upload">
                        <Button asChild disabled={poweredByLogoUploading}>
                          <span className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            {poweredByLogoUploading ? "Enviando..." : formData.powered_by_logo ? "Alterar Logo" : "Adicionar Logo"}
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="powered_by_whatsapp_link">WhatsApp para o Link "Powered By"</Label>
                  <Input
                    id="powered_by_whatsapp_link"
                    value={formData.powered_by_whatsapp_link}
                    onChange={(e) => handleInputChange('powered_by_whatsapp_link', e.target.value)}
                    placeholder="5511999999999"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Número do WhatsApp (com código do país) que será aberto quando clicarem na logo "Powered By". Ex: 5593991234567
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Entrega */}
          <TabsContent value="delivery">
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-slate-200/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bike className="w-5 h-5 text-green-600" />
                  Configurações de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Como funciona?</h3>
                  <p className="text-blue-800 text-sm">
                    Configure o número do WhatsApp do seu entregador. Quando um pedido for feito para entrega, 
                    você poderá clicar no botão "Chamar Entrega" na tela de pedidos para enviar automaticamente 
                    todas as informações do pedido para o entregador via WhatsApp.
                  </p>
                </div>

                <div>
                  <Label htmlFor="delivery_whatsapp_number">WhatsApp do Entregador *</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <Input
                      id="delivery_whatsapp_number"
                      value={formData.delivery_whatsapp_number}
                      onChange={(e) => handleInputChange('delivery_whatsapp_number', e.target.value)}
                      placeholder="5593991234567"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Digite apenas números, incluindo código do país e DDD. Exemplo: 5593991234567
                  </p>
                </div>

                {formData.delivery_whatsapp_number && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">✅ Configuração Ativa</h4>
                    <p className="text-green-800 text-sm">
                      O botão "Chamar Entrega" estará disponível para pedidos de entrega na tela de gerenciamento de pedidos.
                    </p>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-semibold text-slate-900 mb-3">Exemplo de mensagem que será enviada:</h4>
                  <div className="bg-slate-100 p-4 rounded-lg text-sm font-mono">
                    <strong>*NOVO PEDIDO PARA ENTREGA* 🛵</strong><br/>
                    <strong>*Cliente:* </strong>João Silva<br/>
                    <strong>*Contato:* </strong>93999123456<br/><br/>
                    <strong>*Endereço:* </strong>Rua das Flores, 123 - Centro<br/><br/>
                    <strong>*Valor Total:* </strong>R$ 45,00<br/>
                    <strong>*Forma de Pagamento:* </strong>Dinheiro<br/><br/>
                    <strong>*Itens:*</strong><br/>
                    - 2x Pizza Margherita<br/>
                    - 1x Refrigerante 2L<br/><br/>
                    Por favor, confirmar o recebimento.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Bairros/Zonas de Entrega */}
          <TabsContent value="zones">
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-slate-200/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  Taxa de Entrega por Bairro
                </CardTitle>
                <p className="text-sm text-slate-500 pt-1">
                  Configure as taxas de entrega para diferentes bairros da sua cidade.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Como funciona?</h3>
                  <p className="text-blue-800 text-sm">
                    Defina os bairros que você atende e a taxa de entrega para cada um. 
                    Durante o checkout, o cliente selecionará o bairro e a taxa será aplicada automaticamente.
                  </p>
                </div>

                <div className="space-y-4">
                  {deliveryZones.map((zone, index) => (
                    <div key={index} className="flex gap-4 items-end p-4 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <Label>Nome do Bairro</Label>
                        <Input
                          value={zone.neighborhood}
                          onChange={(e) => handleZoneChange(index, 'neighborhood', e.target.value)}
                          placeholder="Ex: Centro, Vila Nova, etc."
                          className="mt-1"
                        />
                      </div>
                      <div className="w-32">
                        <Label>Taxa (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={zone.fee}
                          onChange={(e) => handleZoneChange(index, 'fee', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => removeZone(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  <Button variant="outline" onClick={addZone} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Bairro
                  </Button>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <Button 
                    onClick={saveDeliveryZones}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Salvando Zonas...' : 'Salvar Zonas de Entrega'}
                  </Button>
                </div>

                {deliveryZones.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Prévia das Taxas:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {deliveryZones
                        .filter(zone => zone.neighborhood)
                        .map((zone, index) => (
                        <div key={index} className="flex justify-between p-2 bg-white rounded">
                          <span className="font-medium">{zone.neighborhood}</span>
                          <span className="text-green-700">R$ {zone.fee.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Aparência */}
          <TabsContent value="appearance">
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-slate-200/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Aparência da Loja
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="theme_primary">Cor Primária (Botões e Links)</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="color"
                        id="theme_primary"
                        value={formData.theme_primary}
                        onChange={(e) => handleInputChange('theme_primary', e.target.value)}
                        className="w-12 h-10 rounded border border-slate-200"
                      />
                      <Input
                        value={formData.theme_primary}
                        onChange={(e) => handleInputChange('theme_primary', e.target.value)}
                        placeholder="#1e40af"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="theme_accent">Cor de Destaque (Badges, Ícones)</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="color"
                        id="theme_accent"
                        value={formData.theme_accent}
                        onChange={(e) => handleInputChange('theme_accent', e.target.value)}
                        className="w-12 h-10 rounded border border-slate-200"
                      />
                      <Input
                        value={formData.theme_accent}
                        onChange={(e) => handleInputChange('theme_accent', e.target.value)}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="theme_text">Cor do Texto Principal</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="color"
                        id="theme_text"
                        value={formData.theme_text}
                        onChange={(e) => handleInputChange('theme_text', e.target.value)}
                        className="w-12 h-10 rounded border border-slate-200"
                      />
                      <Input
                        value={formData.theme_text}
                        onChange={(e) => handleInputChange('theme_text', e.target.value)}
                        placeholder="#0f172a"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="theme_background">Cor de Fundo</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="color"
                        id="theme_background"
                        value={formData.theme_background}
                        onChange={(e) => handleInputChange('theme_background', e.target.value)}
                        className="w-12 h-10 rounded border border-slate-200"
                      />
                      <Input
                        value={formData.theme_background}
                        onChange={(e) => handleInputChange('theme_background', e.target.value)}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Dica:</strong> Clique em "Salvar Configurações" para ver as mudanças aplicadas na sua loja.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Banners */}
          <TabsContent value="banners">
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-slate-200/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-indigo-600" />
                  Banners da Página Principal
                </CardTitle>
                <p className="text-sm text-slate-500 pt-1">
                  Adicione imagens separadas para desktop e mobile para a melhor experiência.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {formData.banner_images.map((banner, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Banner {index + 1}</h4>
                        <Button variant="outline" onClick={() => removeBanner(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Título do Banner</Label>
                          <Input
                            value={banner.title}
                            onChange={(e) => handleBannerChange(index, 'title', e.target.value)}
                            placeholder="Título opcional"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Link do Banner</Label>
                          <Input
                            value={banner.link}
                            onChange={(e) => handleBannerChange(index, 'link', e.target.value)}
                            placeholder="Link opcional"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Desktop Image */}
                        <div className="space-y-2">
                          <Label>Imagem para Desktop</Label>
                          <p className="text-xs text-slate-500">Recomendado: 1200x400 pixels.</p>
                          <div className="flex items-center gap-2">
                            {banner.url_desktop && (
                              <img src={banner.url_desktop} alt="Banner Desktop" className="w-16 h-10 object-cover rounded" />
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'banner_images', { bannerIndex: index, urlType: 'desktop' })}
                              className="hidden"
                              id={`banner-desktop-upload-${index}`}
                              disabled={isUploading}
                            />
                            <label
                              htmlFor={`banner-desktop-upload-${index}`}
                              className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer", isUploading && "opacity-50 cursor-not-allowed")}
                            >
                              {isUploading ? 'Enviando...' : 'Escolher Imagem'}
                            </label>
                          </div>
                        </div>

                        {/* Mobile Image */}
                        <div className="space-y-2">
                          <Label>Imagem para Celular</Label>
                           <p className="text-xs text-slate-500">Recomendado: 600x400 pixels.</p>
                          <div className="flex items-center gap-2">
                            {banner.url_mobile && (
                              <img src={banner.url_mobile} alt="Banner Mobile" className="w-16 h-10 object-cover rounded" />
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'banner_images', { bannerIndex: index, urlType: 'mobile' })}
                              className="hidden"
                              id={`banner-mobile-upload-${index}`}
                              disabled={isUploading}
                            />
                            <label
                              htmlFor={`banner-mobile-upload-${index}`}
                              className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer", isUploading && "opacity-50 cursor-not-allowed")}
                            >
                              {isUploading ? 'Enviando...' : 'Escolher Imagem'}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" onClick={addBanner}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Banner
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
