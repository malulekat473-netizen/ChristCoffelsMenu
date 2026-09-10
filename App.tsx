import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
//import { SafeAreaView } from 'react-native-safe-area-context';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Share,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useState } from 'react';

type Course = 'Starter' | 'Main' | 'Dessert';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  course: Course;
  price: number;
};

type FormErrors = Partial<Record<'name' | 'description' | 'course' | 'price', string>>;

const courses: Course[] = ['Starter', 'Main', 'Dessert'];

export default function App() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState<Course | null>(null);
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  function validateForm(): FormErrors {
    const nextErrors: FormErrors = {};
    const numericPrice = Number(price.replace(',', '.'));

    if (!name.trim()) nextErrors.name = 'Enter a dish name.';
    if (!description.trim()) nextErrors.description = 'Add a short description.';
    if (!course) nextErrors.course = 'Choose a course.';
    if (!price.trim()) nextErrors.price = 'Enter a price.';
    else if (!Number.isFinite(numericPrice) || numericPrice <= 0) nextErrors.price = 'Enter a valid price greater than 0.';

    return nextErrors;
  }

  function addMenuItem() {
    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !course) return;

    setMenuItems((currentItems: MenuItem[]) => [
      ...currentItems,
      {
        id: `${Date.now()}-${currentItems.length}`,
        name: name.trim(),
        description: description.trim(),
        course,
        price: Number(price.replace(',', '.')),
      },
    ]);
    setName('');
    setDescription('');
    setCourse(null);
    setPrice('');
  }
  
  async function shareMenu() {
    if (menuItems.length === 0) return;
    
    const menuText = [
      "ChristCoffel's Restaurant Menu",
      '',
      ...menuItems.map((item: MenuItem) => `${item.name} (${item.course}) - R ${item.price.toFixed(2)}\n${item.description}`),
    ].join('\n\n');
    
    await Share.share({ message: menuText, title: "ChristCoffel's Restaurant Menu" });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.brandMark}>
              <Ionicons name="restaurant-outline" size={25} color="#FFF9F2" />
            </View>
            <View>
              <Text style={styles.eyebrow}>CHEF'S MENU MANAGER</Text>
              <Text style={styles.title}>ChristCoffel's Resturant</Text>
            </View>
          </View>

          <View style={styles.introRow}>
            <View>
              <Text style={styles.sectionTitle}>Create a menu item</Text>
              <Text style={styles.helper}>Add a dish to your restaurant's menu.</Text>
            </View>
            <Text style={styles.itemCount}>{menuItems.length} {menuItems.length === 1 ? 'item' : 'items'}</Text>
          </View>

          <View style={styles.form}>
            <FieldLabel label="Dish name" required />
            <TextInput
              value={name}
              onChangeText={(value: string) => { setName(value); if (errors.name) setErrors({ ...errors, name: undefined }); }}
              placeholder="e.g. Herb-crusted salmon"
              placeholderTextColor="#A39A8D"
              style={[styles.input, errors.name && styles.inputError]}
            />
            {errors.name && <Text style={styles.error}>{errors.name}</Text>}

            <FieldLabel label="Description" required />
            <TextInput
              value={description}
              onChangeText={(value: string) => { setDescription(value); if (errors.description) setErrors({ ...errors, description: undefined }); }}
              placeholder="Describe the dish and its ingredients"
              placeholderTextColor="#A39A8D"
              multiline
              textAlignVertical="top"
              style={[styles.input, styles.descriptionInput, errors.description && styles.inputError]}
            />
            {errors.description && <Text style={styles.error}>{errors.description}</Text>}

            <FieldLabel label="Course" required />
            <View style={styles.courseRow}>
              {courses.map((option) => (
                <Pressable key={option} onPress={() => { setCourse(option); setErrors({ ...errors, course: undefined }); }} style={[styles.courseButton, course === option && styles.courseButtonSelected]}>
                  <Text style={[styles.courseText, course === option && styles.courseTextSelected]}>{option}</Text>
                </Pressable>
              ))}
            </View>
            {errors.course && <Text style={styles.error}>{errors.course}</Text>}

            <FieldLabel label="Price" required />
            <View style={[styles.priceWrap, errors.price && styles.inputError]}>
              <Text style={styles.currency}>R</Text>
              <TextInput
                value={price}
                onChangeText={(value: string) => { setPrice(value); if (errors.price) setErrors({ ...errors, price: undefined }); }}
                placeholder="0.00"
                placeholderTextColor="#A39A8D"
                keyboardType="decimal-pad"
                style={styles.priceInput}
              />
            </View>
            {errors.price && <Text style={styles.error}>{errors.price}</Text>}

            <Pressable onPress={addMenuItem} style={({ pressed }: { pressed: boolean }) => [styles.addButton, pressed && styles.addButtonPressed]}>
              <Ionicons name="add" size={22} color="#FFF9F2" />
              <Text style={styles.addButtonText}>Add menu item</Text>
            </Pressable>
          </View>

          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Your menu</Text>
            <View style={styles.listActions}>
              {menuItems.length > 0 && <Text style={styles.listHint}>Latest additions appear first</Text>}
              <Pressable
                accessibilityLabel="Share menu"
                accessibilityRole="button"
                onPress={shareMenu}
                style={({ pressed }: { pressed: boolean }) => [styles.shareButton, pressed && styles.shareButtonPressed]}
              >
                <Ionicons name="share-outline" size={17} color="#C7502C" />
                <Text style={styles.shareButtonText}>Share</Text>
              </Pressable>
            </View>
          </View>

          {menuItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={29} color="#C8B9A7" />
              <Text style={styles.emptyTitle}>Your menu is waiting</Text>
              <Text style={styles.emptyText}>Add your first dish above to see it here.</Text>
            </View>
          ) : (
            <View style={styles.menuList}>
              {[...menuItems].reverse().map((item) => (
                <View key={item.id} style={styles.menuCard}>
                  <View style={styles.cardTopLine}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <Text style={styles.cardPrice}>R {item.price.toFixed(2)}</Text>
                  </View>
                  <Text style={styles.cardDescription}>{item.description}</Text>
                  <View style={styles.courseTag}><Text style={styles.courseTagText}>{item.course}</Text></View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return <Text style={styles.label}>{label}{required && <Text style={styles.required}> *</Text>}</Text>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F3EC' },
  flex: { flex: 1 },
  container: { padding: 22, paddingBottom: 44 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 30 },
  brandMark: { width: 49, height: 49, borderRadius: 16, backgroundColor: '#E7683D', alignItems: 'center', justifyContent: 'center' },
  eyebrow: { color: '#9A8E81', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 3 },
  title: { color: '#2D2925', fontSize: 22, fontWeight: '800' },
  introRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
  sectionTitle: { color: '#2D2925', fontSize: 19, fontWeight: '800' },
  helper: { color: '#81766B', fontSize: 13, marginTop: 5 },
  itemCount: { color: '#E7683D', fontSize: 13, fontWeight: '700', paddingBottom: 2 },
  form: { backgroundColor: '#FFFDF9', borderRadius: 18, padding: 17, shadowColor: '#6D5542', shadowOpacity: 0.07, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  label: { color: '#49423B', fontSize: 13, fontWeight: '700', marginBottom: 7, marginTop: 12 },
  required: { color: '#E7683D' },
  input: { borderWidth: 1, borderColor: '#E5DDD2', borderRadius: 10, color: '#2D2925', fontSize: 15, paddingHorizontal: 13, height: 46, backgroundColor: '#FFFEFC' },
  inputError: { borderColor: '#D9574B' },
  descriptionInput: { height: 74, paddingTop: 12 },
  error: { color: '#C5463A', fontSize: 11, marginTop: 5 },
  courseRow: { flexDirection: 'row', gap: 8 },
  courseButton: { flex: 1, height: 42, borderRadius: 9, borderWidth: 1, borderColor: '#E5DDD2', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFEFC' },
  courseButtonSelected: { backgroundColor: '#FFF0E9', borderColor: '#E7683D' },
  courseText: { color: '#81766B', fontSize: 13, fontWeight: '600' },
  courseTextSelected: { color: '#C7502C', fontWeight: '800' },
  priceWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5DDD2', borderRadius: 10, height: 46, backgroundColor: '#FFFEFC' },
  currency: { color: '#81766B', fontWeight: '700', fontSize: 15, paddingLeft: 13 },
  priceInput: { flex: 1, color: '#2D2925', fontSize: 15, paddingHorizontal: 8 },
  addButton: { height: 49, backgroundColor: '#E7683D', borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 20 },
  addButtonPressed: { backgroundColor: '#C7502C' },
  addButtonText: { color: '#FFF9F2', fontSize: 15, fontWeight: '800' },
  listHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 30, marginBottom: 13 },
  listActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  listHint: { color: '#9A8E81', fontSize: 11 },
  shareButton: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: '#E7B29B', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 },
  shareButtonPressed: { backgroundColor: '#FFF0E9' },
  shareButtonText: { color: '#C7502C', fontSize: 12, fontWeight: '800' },
  emptyState: { alignItems: 'center', borderWidth: 1, borderColor: '#E5DDD2', borderStyle: 'dashed', borderRadius: 16, paddingVertical: 30, paddingHorizontal: 20 },
  emptyTitle: { color: '#554C43', fontSize: 15, fontWeight: '800', marginTop: 10 },
  emptyText: { color: '#9A8E81', fontSize: 13, marginTop: 5 },
  menuList: { gap: 11 },
  menuCard: { backgroundColor: '#FFFDF9', borderRadius: 15, padding: 16, borderLeftWidth: 4, borderLeftColor: '#E7A64C' },
  cardTopLine: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cardName: { color: '#2D2925', fontSize: 16, fontWeight: '800', flex: 1 },
  cardPrice: { color: '#C7502C', fontSize: 15, fontWeight: '800' },
  cardDescription: { color: '#81766B', fontSize: 13, lineHeight: 19, marginTop: 7, marginBottom: 11 },
  courseTag: { alignSelf: 'flex-start', backgroundColor: '#F1E9DE', borderRadius: 6, paddingHorizontal: 9, paddingVertical: 4 },
  courseTagText: { color: '#756758', fontSize: 11, fontWeight: '700' },
});
