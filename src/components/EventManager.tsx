import { useState } from 'react';
import "@radix-ui/themes/styles.css";
import { 
  Card, 
  Theme, 
  Button, 
  Tabs, 
  Dialog, 
  Text, 
  TextField, 
  Flex, 
  Grid
} from "@radix-ui/themes";
import { 
  MagnifyingGlassIcon, 
  CheckCircledIcon, 
  PersonIcon, 
  ReloadIcon,
  MobileIcon 
} from "@radix-ui/react-icons";
import { CreditCardIcon, GiftIcon } from 'lucide-react';

// TypeScript Interfaces
interface PlusOne {
  id: string;
  name: string;
  mainGuestId: string;
  checkedIn: boolean;
  nfcTag?: string;
}

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  tableNumber: string;
  dietaryRestrictions?: string;
  plusOne: boolean;
  plusOnes: PlusOne[];
  checkedIn: boolean;
  souvenirReceived: boolean;
  rsvpSource: 'online' | 'onsite';
  nfcTag?: string;
}

interface NFCTag {
  serialNumber: string;
  assignedTo: string | null;
  data: any;
}

// Mock Data
const INITIAL_GUESTS: Guest[] = [
  {
    id: "guest-001",
    firstName: "Jane",
    lastName: "Smith",
    tableNumber: "12",
    dietaryRestrictions: "Vegetarian",
    plusOne: true,
    plusOnes: [],
    checkedIn: false,
    souvenirReceived: false,
    rsvpSource: "online",
    nfcTag: null
  },
  {
    id: "guest-002",
    firstName: "John",
    lastName: "Doe",
    tableNumber: "8",
    plusOne: false,
    plusOnes: [],
    checkedIn: true,
    souvenirReceived: true,
    rsvpSource: "online",
    nfcTag: "04:A1:B2:C3:D4"
  },
  {
    id: "guest-003",
    firstName: "Alice",
    lastName: "Johnson",
    tableNumber: "15",
    plusOne: true,
    plusOnes: [
      {
        id: "plusone-1",
        name: "Bob Johnson",
        mainGuestId: "guest-003",
        checkedIn: true,
        nfcTag: "04:E5:F6:G7:H8"
      }
    ],
    checkedIn: true,
    souvenirReceived: false,
    rsvpSource: "online",
    nfcTag: "04:I9:J0:K1:L2"
  }
];

export const EventManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("check-in");
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [scanning, setScanning] = useState<boolean>(false);
  const [currentNfcTag, setCurrentNfcTag] = useState<NFCTag | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  // Compute Stats
  const stats = {
    totalGuests: guests.length,
    checkedIn: guests.filter(g => g.checkedIn).length,
    onlineRSVP: guests.filter(g => g.rsvpSource === "online").length,
    souvenirGiven: guests.filter(g => g.souvenirReceived).length,
    plusOnes: guests.filter(g => g.plusOne).length
  };

  // NFC Scanning logic (no simulation)
  const startScanning = async () => {
    setScanning(true);
    try {
      // Here, you would interface with your device's NFC API
      // Assuming a successful scan, set the tag info
      const tag: NFCTag = {
        serialNumber: "04:XX:YY:ZZ:AA", // Example serial number
        assignedTo: null,
        data: {} // Additional data from the tag can be added
      };
      setCurrentNfcTag(tag);
    } catch (error) {
      console.error("Error scanning NFC tag:", error);
    }
    setScanning(false);
  };

  // Filtering and Searching
  const filteredGuests = guests.filter(guest =>
    `${guest.firstName} ${guest.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Check-in Tab Component
  const CheckInTab = () => (
    <Flex direction="column" gap="4">
      <Button 
        onClick={startScanning} 
        disabled={scanning}
        style={{ width: '100%' }}
      >
        {scanning ? (
          <Flex align="center" gap="2">
            <ReloadIcon className="animate-spin" />
            Scanning...
          </Flex>
        ) : (
          <Flex align="center" gap="2">
            <MobileIcon />
            Scan NFC Tag
          </Flex>
        )}
      </Button>
      
      <Card>
        {guests.filter(g => g.checkedIn).slice(0, 3).map(guest => (
          <Flex key={guest.id} justify="between" align="center" py="2" style={{ borderBottom: '1px solid var(--gray-a2)' }}>
            <Flex direction="column">
              <Text as="div">{guest.firstName} {guest.lastName}</Text>
              <Text as="div" color="gray" size="1">NFC Tag: {guest.nfcTag}</Text>
            </Flex>
            <CheckCircledIcon color="green" />
          </Flex>
        ))}
      </Card>
    </Flex>
  );

  // Guest List Tab Component
  const GuestListTab = () => (
    <Flex direction="column" gap="4">
      <Flex gap="2">
        <TextField.Root style={{ flexGrow: 1 }} placeholder="Search guests..." >
          <TextField.Slot 
            onChange={(e) => setSearchTerm(e.currentTarget.nodeValue)}
          />
        </TextField.Root>
        <Button 
          variant="outline" 
          onClick={() => {/* Future filter logic */}}
        >
          <MagnifyingGlassIcon />
        </Button>
      </Flex>
      
      <Flex direction="column" gap="2">
        {filteredGuests.map(guest => (
          <Card 
            key={guest.id} 
            onClick={() => setSelectedGuest(guest)}
            style={{ 
              cursor: 'pointer', 
              opacity: guest.checkedIn ? 0.6 : 1,
            }}
          >
            <Flex justify="between" align="center">
              <Flex direction="column">
                <Text as="div" weight="bold">{guest.firstName} {guest.lastName}</Text>
                <Text as="div" color="gray" size="1">
                  Table: {guest.tableNumber} | 
                  Status: {guest.checkedIn ? 'Checked In' : 'Not Checked In'}
                </Text>
                {guest.nfcTag && (
                  <Text as="div" color="gray" size="1">NFC Tag: {guest.nfcTag}</Text>
                )}
              </Flex>
              <Button 
                size="1" 
                variant={guest.souvenirReceived ? "soft" : "solid"}
              >
                {guest.souvenirReceived ? 'Given' : 'Give Souvenir'}
              </Button>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Flex>
  );

  // Dashboard Tab Component
  const DashboardTab = () => (
    <Flex direction="column" gap="4">
      <Card>
        <Grid columns="2" gap="4">
          <Flex direction="column">
            <Text color="gray" size="1">Total Guests</Text>
            <Text size="6" weight="bold">{stats.totalGuests}</Text>
          </Flex>
          <Flex direction="column">
            <Text color="gray" size="1">Checked In</Text>
            <Text size="6" weight="bold">{stats.checkedIn}</Text>
          </Flex>
          <Flex direction="column">
            <Text color="gray" size="1">Online RSVPs</Text>
            <Text size="6" weight="bold">{stats.onlineRSVP}</Text>
          </Flex>
          <Flex direction="column">
            <Text color="gray" size="1">Plus Ones</Text>
            <Text size="6" weight="bold">{stats.plusOnes}</Text>
          </Flex>
        </Grid>
      </Card>
      
      <Card>
        <Flex justify="between">
          <Flex direction="column">
            <Text color="gray" size="1">Souvenirs Given</Text>
            <Text size="6" weight="bold">{stats.souvenirGiven}</Text>
          </Flex>
          <Flex direction="column">
            <Text color="gray" size="1">Remaining</Text>
            <Text size="6" weight="bold">{stats.totalGuests - stats.souvenirGiven}</Text>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );

  return (
    <Theme>
      <Flex direction="column" maxWidth="480px">
        <Card>
          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Trigger value="check-in">
                <PersonIcon /> Check-in
              </Tabs.Trigger>
              <Tabs.Trigger value="guest-list">
                <MagnifyingGlassIcon /> Guests
              </Tabs.Trigger>
              <Tabs.Trigger value="dashboard">
                <CreditCardIcon /> Dashboard
              </Tabs.Trigger>
              <Tabs.Trigger value="souvenirs">
                <GiftIcon /> Souvenirs
              </Tabs.Trigger>
            </Tabs.List>
            
            <Tabs.Content value="check-in">
              <CheckInTab />
            </Tabs.Content>
            <Tabs.Content value="guest-list">
              <GuestListTab />
            </Tabs.Content>
            <Tabs.Content value="dashboard">
              <DashboardTab />
            </Tabs.Content>
          </Tabs.Root>
        </Card>
      </Flex>
    </Theme>
  );
};

export default EventManager;
